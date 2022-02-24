'use strict';

const
    fs = require('fs'),
    path = require('path'),

    abLog = require('ab-log'),
    abMySQL = require('ab-mysql'),
    js0 = require('js0'),

    abData = require('ab-data'),

    espada = require('./espada')
;

class abData_DBSync_Class
{

    constructor()
    {

    }

    async createDatabaseInfo_Async(db)
    {
        let results = null;

        let databaseInfo = new abData.DatabaseInfo();

        results = await db.query_Select_Async('SHOW TABLES;');
        for (let row of results) {
            let tableName = row[Object.keys(row)[0]];
            if (tableName[0] === '_')
                continue;

            let tableInfo = new abData.TableInfo(tableName);

            results = await db.query_Select_Async(`DESC \`${tableInfo.name}\`;`);
            for (let row of results) {
                tableInfo.addFieldInfo(new abData.FieldInfo(
                    row.Field,
                    null,
                    [ row.Type ],
                    row.Key,
                    row.Null === 'NO',
                ));
            }

            databaseInfo.addTableInfo(tableInfo);
        }

        return databaseInfo;
    }

    async exec_Async(scheme, connectionInfo)
    {
        js0.args(arguments, abData.scheme.DataScheme, js0.RawObject);
        js0.typeE(connectionInfo, js0.Preset({
            host: 'string',
            database: 'string',
            user: 'string',
            password: 'string',
        }));

        let dbInfo_Scheme = scheme.createDatabaseInfo();;

        // let ignored_TableNames = scheme.getIgnored_TableNames();

        let db = abMySQL.connect(connectionInfo);

        let dbInfo_DB = await this.createDatabaseInfo_Async(db);
    
        let actions = abData.DatabaseInfo.Compare(scheme, dbInfo_Scheme, dbInfo_DB);

        for (let tableInfo of actions.tables.delete) {
            let result = await db.query_Execute_Async(`DROP TABLE ${tableInfo.name}`);

            abLog.error('Deleted: ', tableInfo.name);
        }

        for (let tableInfo of actions.tables.create) {
            let tableInfo = dbInfo_Scheme.getTableInfo_ByName(tableName);

            let query_Create = tableInfo.getQuery_Create() + 
                    ' ENGINE=InnoDB DEFAULT CHARSET=utf8';

            let result = await db.query_Execute_Async(query_Create);

            abLog.success('Created: ', tableInfo.name);
        }

        for (let alterInfo of actions.tables.alter) {
            let query_Alter = `ALTER TABLE ${alterInfo.tableInfo.name}`;

            let query_Fields_Arr = [];
            for (let fieldInfo of alterInfo.delete)
                query_Fields_Arr.push(`DROP COLUMN \`${fieldInfo.name}\``);
            for (let fieldInfo of alterInfo.create)
                query_Fields_Arr.push(`ADD COLUMN ` + fieldInfo.getQuery_Column());
            query_Alter += ' ' + query_Fields_Arr.join(', ');

            let result = await db.query_Execute_Async(query_Alter);

            abLog.success(`Altered: alterInfo.tableInfo.name`);
            if (alterInfo.delete.length > 0) {
                abLog.success('  deleted:');
                for (let fieldInfo of alterInfo.delete)
                    abLog.success(`    - ${fieldInfo.name}`);
            }
            if (alterInfo.create.length > 0) {
                abLog.success('  created:');
                for (let fieldInfo of alterInfo.create)
                    abLog.success(`    - ${fieldInfo.name}`);
            }
        }

        db.disconnect();
    }

    async sync_Espada_Async(scheme, info)
    {
        js0.args(arguments, abData.scheme.DataScheme, js0.RawObject);
        js0.typeE(info, js0.Preset({
            path: 'string',
        }));

        let dbInfo_Scheme = scheme.createDatabaseInfo();
        let packagePaths = [];
        let packageDirs = fs.readdirSync(path.join(info.path, 'packages'));
        for (let packageDir of packageDirs)
            packagePaths.push(path.join(info.path, 'packages', packageDir));

        for (let tableInfo of dbInfo_Scheme.tableInfos)
            await espada.createClass_Async(packagePaths, tableInfo);
    }

}
module.exports = new abData_DBSync_Class();