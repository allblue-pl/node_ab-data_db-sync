import { ABDField, abdFields as f } from "ab-data";
import type TableDef from "ab-data/ts-lib/TableDef.ts";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import { findPackage, getETable, type ETable } from "./helpers.ts";

function createEspadaTableClass(packagePaths: Array<string>, tableDef: TableDef):
        void {
    let eTable = getETable(tableDef);

    let packagePath = findPackage(packagePaths, eTable);
    if (packagePath === null) {
        abLog.warn(`Cannot find tables '${eTable.fullName}' package. Skipping.`);
        return;
    }

    createClass(packagePath, eTable);
    // createClass_Child(packagePath, table);
};
export default createEspadaTableClass;


function createClass(packagePath: string, eTable: ETable): void {
    let pks_Arr = [];
    for (let pk of eTable.table.pks)
        pks_Arr.push(`'${pk}'`);
    let pks_Str = pks_Arr.join(', ');

    let content = '';
    content += 
`<?php namespace EC\\${eTable.packageName}\\_Tables;
defined('_ESPADA') or die(NO_ACCESS);

use E, EC;
use EC\\Database;
use EC\\Database\\MDatabase;
use EC\\Database\\TTable;

/**
 *
 * @phpstan-type _T_R${eTable.fullName} array{`;

    for (let [ columnName, column ] of eTable.table.columns) {
        let phpStanType = getPHPStanType(column.field);

        content += `
 *     ${columnName}: ${phpStanType},`;
    }

    content += `
 * }
 */
class _T${eTable.name} extends TTable {
    public function __construct(MDatabase $db, $tablePrefix = 't') {
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

    /**
     *
     * @param array $row
     * @return _T_R${eTable.fullName}
     */
    public function assertRow(array $row, bool $stripRow = false): array {
        if ($stripRow)
            $row = $this->stripRow($row);

        /* @phpstan-ignore return.type */
        return $row;
    }

    /**
     *
     * @param array $rows
     * @return array<_T_R${eTable.fullName}>
     */
    public function assertRows(array $rows): array {
        return $rows;
    }
}
`
    ;

    fs.writeFileSync(path.join(packagePath, "classes", "_Tables", `_T${eTable.name}.php`), 
            content);
    abLog.success(`Saved Table: ${eTable.fullName}.`);
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

function getFieldDeclaration(columnName: string, field: ABDField): string {
    return `'${columnName}' => new Database\\F` + getFieldType(field) + ', ';
}

function getFieldType(field: ABDField): string {
    // Array
    if (field instanceof f.ABDAutoIncrementId)
        return `Int(${field.notNull}, true)`;
    else if (field instanceof f.ABDBlob)
        return `Blob(${field.notNull}, ${field.type})`;
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
        return `Long(true)`;
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

    abLog.warn(`Unsupported field:`, field.getType());
    throw new Error('Unsupported field.');
}

function getPHPStanType(field: ABDField): string {
    // Array
    if (field instanceof f.ABDAutoIncrementId)
        return `int|null`;
    else if (field instanceof f.ABDBlob)
        return `string`;
    else if (field instanceof f.ABDBool)
        return `bool` + (field.notNull ? "" : "|null");
    // else if (field instanceof f.ABDData)
    //     return `Text(${field.notNull}, 'medium)`;
    else if (field instanceof f.ABDDate)
        return `float` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDDateTime)
        return `float` + (field.notNull ? "" : "|null");
    // Double
    else if (field instanceof f.ABDFloat)
        return `float` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDId)
        return `float|null`;
    else if (field instanceof f.ABDInt)
        return `int` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDJSON)
        return `string` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDLong)
        return `float` + (field.notNull ? "" : "|null");
    // Object
    else if(field instanceof f.ABDString)
        return `string` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDTime)
        return `float` + (field.notNull ? "" : "|null");
    else if(field instanceof f.ABDText)
        return `string` + (field.notNull ? "" : "|null");

    abLog.warn(`Unsupported field:`, field.getType());
    throw new Error('Unsupported field.');
}