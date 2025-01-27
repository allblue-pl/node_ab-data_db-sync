'use strict';

const
    abData = require('ab-data'),
    abLog = require('ab-log'),
    fs = require('fs'),
    path = require('path')
;


let createAndroidClass_Async = async (packageName, packagePath, tableInfo) => {
    createClass(packageName, packagePath, tableInfo);
};
module.exports = createAndroidClass_Async;


let createClass = (packageName, packagePath, table) => {
    let content = '';
    content += 
`package ${packageName};

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import pl.allblue.abdata.ABTable;
import pl.allblue.abdata.ABTableColumn;
import pl.allblue.abdatabase.SelectColumnType;

public class T${table.name} extends ABTable {

    public T${table.name}() {
        super(new ABTableColumn[] {`
    ;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];

        if (i > 0)
            content += ',';
        content += `
            ` + getFieldDeclaration(fieldInfo);
        ;
    }

    content += `
        });
    }


    static public class Row extends ABTable.Row {
        public Row(JSONArray jRow, int offset) {
            super(jRow, ${table.fieldInfos.length}, offset);
        }
    
        public Row(JSONArray jRow) {
            this(jRow, 0);
        }
`;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];

        content += getFieldGetColumn(table, fieldInfo, i);
    }

    content += `
        public JSONObject getAsJSONObject(String prefix) {
            JSONObject row = new JSONObject();

            try {`
    ;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];
        content += getFieldSetColumnToJSONObject(table, fieldInfo, i);
    }
            
    content += `
            } catch (JSONException e) {
                Log.e("T${table.name}", 
                        "Cannot get T${table.name} row as JSONObject.", e);
                return new JSONObject();
            }
            return row;
        }

        public JSONObject getAsJSONObject() {
            return this.getAsJSONObject("");
        }
`
    ;

    content += `
        public void setFromJSONObject(JSONObject json, String prefix, 
                int offset) {
            try {`
    ;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];
        content += getFieldSetColumnFromJSONObject(table, fieldInfo, i);
    }
            
    content += `
            } catch (JSONException e) {
                Log.e("T${table.name}", 
                        "Cannot set values from JSONObject.", e);
            }
        }

        public void setFromJSONObject(JSONObject json, String prefix) {
            this.setFromJSONObject(json, prefix, 0);
        }

        public void setFromJSONObject(JSONObject json, int offset) {
            this.setFromJSONObject(json, "", offset);
        }

        public void setFromJSONObject(JSONObject json) {
            this.setFromJSONObject(json, "", offset);
        }
`
    ;


    content += `
    }

}
`
    ;

    fs.writeFileSync(path.join(packagePath, `T${table.name}.java`), content);
    abLog.success(`Saved: ${table.name}.`);
};

function getFieldDeclaration(fieldInfo) {
    return `new ABTableColumn("` + fieldInfo.name + 
            `", SelectColumnType.` + 
            getFieldType(fieldInfo.field) + `)`;
}

function getFieldGetColumn(table, fieldInfo, index) {
    let content = null;
//     if (fieldInfo.field instanceof abData.fields.ABDJSON) {
//         content = `
//         public JSONObject c${fieldInfo.name}() {
//             try {
//                 return jRow.isNull(this.offset + ${index}) ? 
//                         null : new JSONObject(jRow.getString(
//                         this.offset + ${index}));
//             } catch (JSONException e) {
//                 Log.e("T${table.name}", "Cannot get column '${fieldInfo.name}'" +
//                         " value from json row.");
//             }

//             return null;
//         }
// `       
//         ;
//     } else {
        let returnType = getReturnType(fieldInfo.field);
        let getJsonType = 'get' + getJSONType(fieldInfo.field);
        let jsonCast = getJSONCast(fieldInfo.field);

        content = `
        public ${returnType} c${fieldInfo.name}() {
            try {
                return jRow.isNull(this.offset + ${index}) ? 
                    null : ${jsonCast}jRow.${getJsonType}(this.offset + ${index});
            } catch (JSONException e) {
                Log.e("T${table.name}", "Cannot get column '${fieldInfo.name}'" +
                        " value from json row.");
            }

            return null;
        }
`       
        ;
    // }

    return content;
}

function getFieldSetColumnToJSONObject(table, fieldInfo, index) {
    let jsonType = getJSONType(fieldInfo.field);
    let jsonCast = getJSONCast_Reverse(fieldInfo.field);

    let content = `
                row.put(prefix + "${fieldInfo.name}", this.c${fieldInfo.name}() == null ? 
                        JSONObject.NULL : ${jsonCast}this.c${fieldInfo.name}());`;

    return content;
}

function getFieldSetColumnFromJSONObject(table, fieldInfo, index) {
    let jsonType = getJSONType(fieldInfo.field);
    let jsonCast = getJSONCast_Reverse(fieldInfo.field);

    let content = `
                jRow.put(offset + ${index}, json.isNull(prefix + "${fieldInfo.name}") ? 
                        JSONObject.NULL : json.get${jsonType}(prefix + "${fieldInfo.name}"));`;

    return content;
}

function getFieldType(field) {
    let type = field.getSelectType();

    if (type === abData.SelectColumnType.Bool)
        return 'Bool';
    if (type === abData.SelectColumnType.Float)
        return 'Float';
    if (type ===  abData.SelectColumnType.Int)
        return 'Int';
    if (type === abData.SelectColumnType.JSON)
        return 'JSON';
    if (type === abData.SelectColumnType.Long)
        return 'Long';
    if (type === abData.SelectColumnType.String)
        return 'String';

    abLog.warn(`Unknown field type:`, field);
    throw new Error('Unknown field type.');
}

function getJSONCast(field) {
    let type = field.getSelectType();

    if (type === abData.SelectColumnType.Float)
        return '(float)';

    return '';
}

function getJSONCast_Reverse(field) {
    let type = field.getSelectType();

    if (type === abData.SelectColumnType.Float)
        return '(double)';

    return '';
}

function getJSONType(field) {
    let type = field.getSelectType();

    if (type === abData.SelectColumnType.Bool)
        return 'Boolean';
    if (type === abData.SelectColumnType.Float)
        return 'Double';
    if (type ===  abData.SelectColumnType.Int)
        return 'Int';
    if (type === abData.SelectColumnType.Long)
        return 'Long';
    if (type === abData.SelectColumnType.JSON)
        return 'JSONObject';
    if (type === abData.SelectColumnType.String)
        return 'String';

    abLog.warn(`Unknown field type:`, field);
    throw new Error('Unknown field type.');
}

function getReturnType(field) {
    let type = field.getSelectType();

    if (type === abData.SelectColumnType.Bool)
        return 'Boolean';
    if (type === abData.SelectColumnType.Float)
        return 'Float';
    if (type === abData.SelectColumnType.Int)
        return 'Integer';
    if (type === abData.SelectColumnType.JSON)
        return 'JSONObject';
    if (type === abData.SelectColumnType.Long)
        return 'Long';
    if (type === abData.SelectColumnType.String)
        return 'String';

    abLog.warn(`Unknown field type:`, field);
    throw new Error('Unknown field type.');
}