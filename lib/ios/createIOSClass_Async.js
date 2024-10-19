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

    var id: R${table.name}_PK {
        R${table.name}_PK(` + getPKValues(table) + `)
    }

    init(_ json: [AnyObject], offset: Int = 0) {
        super.init(json, ${table.fieldInfos.length}, offset: offset)
    }
`;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];

        content += getFieldGetColumn(table, fieldInfo, i);
    }

    content += `
    func getRowAsJSONObject(prefix: String = "") -> [String: AnyObject] {
        var row = [String: AnyObject]();`
    ;

    for (let i = 0; i < table.fieldInfos.length; i++) {
        let fieldInfo = table.fieldInfos[i];
        content += getFieldSetColumn(table, fieldInfo, i);
    }
            
    content += `
        return row;
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
        if json[offset + ${index}] is NSNull {
            return nil
        }
`;
    }
        
    content += `
        guard let v = json[offset + ${index}] as? ${returnType} else {
            fatalError("T${table.name} -> Cannot get column '${fieldInfo.name}' value from json.")
        }
        
        return v
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

function getFieldSetColumn(table, fieldInfo, index) {
    let content = `
        row[prefix + "${fieldInfo.name}"] = ` + (fieldInfo.notNull ?  '' : `c${fieldInfo.name}() == nil ? NSNull() : `) + `c${fieldInfo.name}() as AnyObject`;

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