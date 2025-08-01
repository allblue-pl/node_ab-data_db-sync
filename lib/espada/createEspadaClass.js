'use strict';

const
    fs = require('fs'),
    path = require('path'),

    abData = require('ab-data'),
    abLog = require('ab-log'),
    js0 = require('js0'),

    f = abData.fields;
;

let dbVersion = new abData.DatabaseVersion('mysql', [ 0, 0, 0 ]);

function createEspadaClass (packagePaths, tableDef) {
    js0.args(arguments, Array, abData.TableDef);
    
    let eTable = getETable(tableDef);

    let packagePath = findPackage(packagePaths, eTable);
    if (packagePath === null) {
        abLog.warn(`Cannot find tables '${eTable.fullName}' package. Skipping.`);
        return;
    }

    createClass(packagePath, eTable);
    // createClass_Child(packagePath, table);
};
module.exports = createEspadaClass;


function createClass(packagePath, eTable) {
    let pks_Arr = [];
    for (let pk of eTable.table.pks)
        pks_Arr.push(`'${pk}'`);
    let pks_Str = pks_Arr.join(', ');

    let content = '';
    content += 
`<?php namespace EC\\${eTable.packageName};
defined('_ESPADA') or die(NO_ACCESS);

use E, EC,
    EC\\Database;

class _T${eTable.name} extends Database\\TTable {
    public function __construct(EC\\MDatabase $db, $tablePrefix = 't') {
        parent::__construct($db, '${eTable.fullName}', $tablePrefix);

        $this->setColumns([`
    ;

    for (let [ columnName, column ] of eTable.table.columns) {
        content += `
            ` + getFieldDeclaration(columnName, 
                        eTable.table.getColumn(columnName).field)
        ;
    }

    content += `
        ]);
        $this->setPKs([ ${pks_Str} ]);
    }
}
`
    ;

    fs.writeFileSync(path.join(packagePath, `classes`, `_T${eTable.name}.php`), 
            content);
    abLog.success(`Saved: ${eTable.fullName}.`);
};


// let createClass_Child = (packagePath, table) => {
//     let childClassPath = path.join(packagePath, `classes`, `T${table.name}.php`);
//     if (fs.existsSync(childClassPath))
//         return;

//     let tablePrefix = '';
//     for (let i = 0; i < table.packageName.length; i++) {
//         if (table.packageName[i] === table.packageName[i].toUpperCase())
//             tablePrefix += table.packageName[i].toLowerCase();
//     }
//     tablePrefix += '_';
//     for (let i = 0; i < table.name.length; i++) {
//         if (table.name[i] === table.name[i].toUpperCase())
//             tablePrefix += table.name[i].toLowerCase();
//     }

//     let content = '';
//     content += 
// `<?php namespace EC\\${table.packageName};
// defined('_ESPADA') or die(NO_ACCESS);

// use E, EC,
//     EC\\Database;

// class T${table.name} extends _T${table.name} {

//     public function __construct(EC\\MDatabase $db) {
//         parent::__construct($db, '${tablePrefix}');
//     }

// }
// `
//     ;

//     fs.writeFileSync(childClassPath, content);
//     abLog.success(`Created child for: ${table.fullName}.`);
// };


function findPackage(packagePaths, eTable) {
    js0.args(arguments, Array, js0.RawObject);

    for (let packagePath of packagePaths) {
        let dirs = fs.readdirSync(packagePath);
        for (let dir of dirs) {
            if (dir === eTable.packageName)
                return path.join(packagePath, dir);
        }
    }

    return null;
};

function getFieldDeclaration(columnName, field) {
    js0.args(arguments, 'string', abData.ABDField);
    
    return `'${columnName}' => new Database\\F` + getFieldType(field) + ', ';
}

function getArgsStr(args) {
    let argsArr = [];
    for (let arg of args) {
        if (typeof arg === 'string')
            argsArr.push(`'${arg}'`);
        else
            argsArr.push(String(arg));
    }

    return argsArr.join(', ');
}

function getFieldType(field) {
    js0.args(arguments, abData.ABDField);
    
    // Array
    if (field instanceof f.ABDAutoIncrementId)
        return `Int(${field.notNull}, true)`;
    else if (field instanceof f.ABDBlob)
        return `Blob(${field.notNull}, ${field.size})`;
    else if (field instanceof f.ABDBool)
        return `Bool(${field.notNull})`;
    // else if (field instanceof f.ABDData)
    //     return `Text(${field.notNull}, 'medium)`;
    else if (field instanceof f.ABDDate)
        return `Date(${field.notNull})`;
    else if (field instanceof f.ABDDateTime)
        return `DateTime(${field.notNull})`;
    // Double
    else if (field instanceof f.ABDFloat)
        return `Float(${field.notNull})`;
    else if (field instanceof f.ABDId)
        return `Long(${field.notNull})`;
    else if (field instanceof f.ABDInt)
        return `Int(${field.notNull}, ${field.unsigned})`;
    else if (field instanceof f.ABDJSON)
        return `Text(${field.notNull}, 'medium')`;
    else if (field instanceof f.ABDLong)
        return `Long(${field.notNull})`;
    // Object
    else if(field instanceof f.ABDString)
        return `String(${field.notNull}, ${field.size})`;
    else if (field instanceof f.ABDTime)
        return `Time(${field.notNull})`;
    else if(field instanceof f.ABDText)
        return `Text(${field.notNull}, '${field.type}')`;

    abLog.warn(`Unknown field:`, field);
    throw new Error('Unknown field');
}

function getETable(tableDef) {
    js0.args(arguments, abData.TableDef);

    let tableName_Arr = tableDef.name.split('_');
    let prefix = '';
    while (tableName_Arr[0] === '') {
        tableName_Arr.splice(0, 1);
        prefix += '_';
    }

    tableName_Arr[0] = prefix + tableName_Arr[0];

    return {
        packageName: tableName_Arr[0],
        fullName: tableDef.name,
        name: tableName_Arr.slice(1).join('_'),
        table: tableDef,
    };
};