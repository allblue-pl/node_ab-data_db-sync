import { ABDField, abdFields as f, RequestDef } from "ab-data";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import type { ABDataDefPreset, DataScheme } from "ab-data";
import abDataDefToPHPStan from "./abDataDefToPHPStan.ts";
import { abDataDefTypes as t } from "ab-data";
import { table } from "console";
import helper from "ab-data/ts-lib/helper.ts";
import { getETable } from "./helpers.ts";

function createEspadaRequestClass(scheme: DataScheme, packagePath: string, 
        namespace: string, requestName: string, requestDef: RequestDef): void {
    createClass(scheme, packagePath, namespace, requestName, requestDef);
    // createClass_Child(packagePath, table);
};
export default createEspadaRequestClass;


function createClass(scheme: DataScheme, packagePath: string, namespace: string, 
        requestName: string, requestDef: RequestDef): void {
    let tableNames: Array<string> = [];
    let actionNames = requestDef.getActionNames();

    let content = "";

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `
 *
 * @phpstan-type _T_R${requestName}_${actionName}_Args array{
`       ;

        content += getPHPStanFromDef(scheme, actionDef.argsDef, tableNames);

        content += ` * }
 * @phpstan-type _T_R${requestName}_${actionName}_Result array{
 *     _debug?: string,
 *     _message?: string,
`      
        ;

        content += getPHPStanFromDef(scheme, actionDef.resultDef, tableNames);

        content += ` * }
 * @phpstan-type _T_R${requestName}_${actionName}_Result_Parsed array{
 *     _debug?: string,
 *     _type: 0|1,
 *     _message: string,
`;
        content += getPHPStanFromDef(scheme, actionDef.resultDef, tableNames);

        content += ` * }`;
    }

    content += `
 */
abstract class _R${requestName} extends RRequest {`
    ;

    for (let actionName of actionNames) {
        content += `
    /**
     *
     * @param _T_R${requestName}_${actionName}_Result $result 
     * @return _T_R${requestName}_${actionName}_Result_Parsed
     */
    static function ${actionName}_Failure(array $result): array {
        $result["_type"] = 1;
        $result["_message"] = array_key_exists("_message", $result) ?
                $result["_message"] : "";

        return $result;
    }

    /**
     *
     * @param _T_R${requestName}_${actionName}_Result $result 
     * @return _T_R${requestName}_${actionName}_Result_Parsed
     */
    static function ${actionName}_Success(array $result): array {
        $result["_type"] = 0;
        $result["_message"] = array_key_exists("_message", $result) ?
                $result["_message"] : "";

        return $result;
    }
`;
    }

    content += `
    public function __construct(CDataStore $dataStore) {
        parent::__construct($dataStore);`;

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `

        $this->setA('${actionName}', "${actionDef.type}", function(?CDevice $device, 
                array $args): array {
            /** @phpstan-ignore argument.type */
            return $this->action_${actionName}($device, $args);
        });`;
    }

    content += `
    }    
`
    ;

    for (let actionName of actionNames) {
        content += `
    /**
     * 
     * @param CDevice $device
     * @param _T_R${requestName}_${actionName}_Args $args
     * @return _T_R${requestName}_${actionName}_Result_Parsed
     */
    abstract public function action_${actionName}(CDevice $device, array $args): array;
`;
    }

    content += `}`;

    let content_Start =
`<?php namespace EC\\${namespace}\\_Requests;
defined('_ESPADA') or die(NO_ACCESS);

use E, EC;
use EC\\ABData\\CDataStore;
use EC\\ABData\\CDevice;
use EC\\ABData\\RRequest;

/**`
    ;

    for (let tableName of tableNames) {
        if (!scheme.hasTable(tableName)) {
            throw new Error(`Table '${tableName}' requested in request '${requestName}' ` + 
                    `does not exist in data schema.`);
        }

        let eTable = getETable(scheme.getTableDef(tableName));

        content_Start += `
 * @phpstan-import-type _T_R${eTable.fullName} from EC\\${eTable.packageName}\\_Tables\\_T${eTable.name}`
        ;
    }

    content = content_Start + content;

    fs.writeFileSync(path.join(packagePath, namespace, "classes", "_Requests", 
            `_R${requestName}.php`), content);
    abLog.success(`Saved Request: ${requestName}.`);
};

function getPHPStanFromDef(scheme: DataScheme, def: ABDataDefPreset, 
        tableNames: Array<string>): string {
    return abDataDefToPHPStan.parsePreset(scheme, def, " *     ", tableNames);
}