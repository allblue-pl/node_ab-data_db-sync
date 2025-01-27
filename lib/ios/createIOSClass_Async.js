'use strict';

const
    abData = require('ab-data'),
    abLog = require('ab-log'),
    fs = require('fs'),
    path = require('path')
;


let createIOSClass_Async = async (packageName, packagePath, tableInfo) => {
    createClass(packageName, packagePath, tableInfo);
};
module.exports = createIOSClass_Async;


let createClass = (packageName, packagePath, table) => {
    let content = '';
    content += 
`
import ABData
import ABDatabase
import ABLibs
import Foundation

class T${table.name}: ABTable {
    init() {
        super.init([`
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
        ])
    }
}

class R${table.name}: ABTableRow, ABTableRowProtocol, Identifiable {
    static var columnsCount: Int {
        get {
            return ${table.fieldInfos.length}
        }
    }

    var id: R${table.name}_PK {
        R${table.name}_PK(` + getPKValues(table) + `)
    }

    override init(_ jRow: JSONArray, offset: Int = 0) {
        super.init(jRow, offset: offset)
    }
`;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];

        content += getFieldGetColumn(table, fieldInfo, i);
    }

    content += `
    func getAsJSONObject(prefix: String = "") -> JSONObject {
        let rowJSON = JSONObject([String: AnyObject]());
`
    ;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];
        content += getFieldSetColumnToJSONObject(table, fieldInfo, i);
    }
            
    content += `

        return rowJSON;
    }

    func setFromJSONObject(_ rowJSON: JSONObject, prefix: String = "") {
`;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];
        content += getFieldSetColumnFromJSONObject(table, fieldInfo, i)
    }

    content += `
    }
}


struct R${table.name}_PK {`;

content += getPKDeclaration(table);
content += `
}
`;

    fs.writeFileSync(path.join(packagePath, `T${table.name}.swift`), content);
    abLog.success(`Saved: ${table.name}.`);
};

function getFieldDeclaration(fieldInfo)
{
    return `ABTableColumn("` + fieldInfo.name + 
            `", SelectColumnType.` + 
            getFieldType(fieldInfo.field) + `)`;
}

function getFieldGetColumn(table, fieldInfo, index)
{
    let returnType = getReturnType(fieldInfo.field);

    let content = `
    func c${fieldInfo.name}() -> ${returnType}` + (fieldInfo.notNull ? '' : '?') + ` {`;

    if (!fieldInfo.notNull) {
        content += `
        if jRow.isNull(offset + ${index}) {
            return nil
        }
`;
    }
        
    content += `
        guard let v = jRow.get(offset + ${index}) as? ${returnType} else {
            fatalError("T${table.name} -> Cannot get column '${fieldInfo.name}' value from 'jRow'.")
        }
        
        return v
    }

    func c${fieldInfo.name}_IsNull() -> Bool {
        return jRow.isNull(offset + ${index})
    }
`;

    return content;
}

function getFieldInfo_ByName(table, fieldName) {
    for (let fi of table.fieldInfos) {
        if (fi.name === fieldName)
            return fi;
    }

    throw new Error(`Field '${fieldName}' does not exist.`);
}

function getFieldSetColumnFromJSONObject(table, fieldInfo, index) {
    let content = `
        if rowJSON.isNull(prefix + "${fieldInfo.name}") {
            jRow.set(offset + ${index}, NSNull())
        } else {
            if let colVal = rowJSON.get(prefix + "${fieldInfo.name}") {
                jRow.set(offset + ${index}, colVal);
            } else {
                print("R${table.name} -> Cannot get column '${fieldInfo.name}' value from 'jRow'.")
            }
        }`;
        

    return content;
}

function getFieldSetColumnToJSONObject(table, fieldInfo, index) {
    let content =`
        rowJSON.set(prefix + "${fieldInfo.name}", ` + (fieldInfo.notNull ?  '' : `c${fieldInfo.name}_IsNull() ? NSNull() : `) + `c${fieldInfo.name}() as AnyObject)`;

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
    if (type === abData.SelectColumnType.Long)
        return 'Long';
    if (type === abData.SelectColumnType.JSON)
        return 'JSON';
    if (type === abData.SelectColumnType.String)
        return 'String';

    abLog.warn(`Unknown field type:`, field);
    throw new Error('Unknown field type.');
}

function getPKDeclaration(table) {
    let declaration = '';
    for (let pk of table.pks) {
        let pkType = getReturnType(getFieldInfo_ByName(table, pk).field);
        declaration += `
    var c${pk}: ${pkType}`;
    }

    return declaration;
}

function getPKValues(table) {
    let values = '';
    for (let pk of table.pks) {
        if (values !== '')
            values += ', ';
        values += `c${pk}: c${pk}()`;
    }

    return values;
}

function getReturnType(field) {
    let type = field.getSelectType();

    if (type === abData.SelectColumnType.Bool)
        return 'Bool';
    if (type === abData.SelectColumnType.Float)
        return 'Float';
    if (type ===  abData.SelectColumnType.Int)
        return 'Int';
    if (type === abData.SelectColumnType.Long)
        return 'Int64';
    if (type === abData.SelectColumnType.JSON)
        return '[String: AnyObject]';
    if (type === abData.SelectColumnType.String)
        return 'String';

    abLog.warn(`Unknown field type:`, field);
    throw new Error('Unknown field type.');
}