import { DatabaseInfo, DatabaseVersion,                  FieldInfo, IndexInfo } from "ab-data";
import TableInfo from "ab-data/lib/TableInfo.js";
import abLog from "ab-log";
import abMySQL, { Database } from "ab-mysql";
                                                                    

export default async function update_DB_Async(scheme            , 
        connectionInfo                  )                {
    let db = abMySQL.connect(connectionInfo);
    let dbInfo = await createDatabaseInfo_Async(db);
    let actions = DatabaseInfo.Compare(scheme, dbInfo);

    for (let tableName of actions.tables.delete) {
        let r = await db.query_Execute_Async(`DROP TABLE ${tableName}`);
        if (!r)
            throw new Error(`Cannot drop table '${tableName}'.`);
        abLog.error(`Deleted Table: ${tableName}`);
    }

    for (let tableDef of actions.tables.create) {
        let query_Create = TableInfo.GetQuery_Create(
                dbInfo.dbVersion, scheme, tableDef) + 
                ' ENGINE=InnoDB DEFAULT CHARSET=utf8';
        let r = await db.query_Execute_Async(query_Create);
        if (!r)
            throw new Error(`Cannot create table '${tableDef.name}'.`);

        abLog.success(`Created Table: ${tableDef.name}`);
    }

    for (let alterInfo of actions.tables.alter) {
        let query_Alter = `ALTER TABLE ${alterInfo.tableDef.name}`;

        let query_Fields_Arr = [];
        for (let columnName of alterInfo.delete)
            query_Fields_Arr.push(`DROP COLUMN \`${columnName}\``);
        for (let columnInfo of alterInfo.create) {
            query_Fields_Arr.push(`ADD COLUMN ` + columnInfo.field
                    .getQuery_Column(dbInfo.dbVersion, columnInfo.name));
        }
        for (let columnInfo of alterInfo.change) {
            query_Fields_Arr.push(`CHANGE COLUMN ${columnInfo.name} ` + columnInfo.field
                    .getQuery_Column(dbInfo.dbVersion, columnInfo.name));
        }
        query_Alter += ' ' + query_Fields_Arr.join(', ');

        let r = await db.query_Execute_Async(query_Alter);
        if (!r)
            throw new Error(`Cannot alter table '${alterInfo.tableDef.name}'.`);

        abLog.success(`Altered: ${alterInfo.tableDef.name}`);
        if (alterInfo.delete.length > 0) {
            abLog.success('  deleted:');
            for (let columnName of alterInfo.delete)
                abLog.success(`    - ${columnName}`);
        }
        if (alterInfo.create.length > 0) {
            abLog.success('  created:');
            for (let columnInfo of alterInfo.create)
                abLog.success(`    - ${columnInfo.name}`);
        }
        if (alterInfo.change.length > 0) {
            abLog.success('  changed:');
            for (let columnInfo of alterInfo.change)
                abLog.success(`    - ${columnInfo.name}`);
        }
    }

    /* Indexes */
    let dbInfo_Indexes = await createDatabaseInfo_Async(db);
    let actions_Indexes = DatabaseInfo.CompareIndexes(scheme, 
            dbInfo_Indexes);

    for (let alterInfo of actions_Indexes.tables.alter) {
        console.log(`Altered Indexes: ${alterInfo.tableDef.name}`);

        /* Primary Keys */
        if (alterInfo.pks_Delete || alterInfo.pks_Create) {
            let pks_Str = alterInfo.tableDef.pks.join(', ');
            let query_ChangePKs = `ALTER TABLE ${alterInfo.tableDef.name}`;
            if (alterInfo.pks_Delete)
                query_ChangePKs += ` DROP PRIMARY KEY`;
            if (alterInfo.pks_Create) {
                if (alterInfo.pks_Delete)
                    query_ChangePKs += ', ';
                query_ChangePKs += ` ADD PRIMARY KEY (${pks_Str})`
            }
            let r = await db.query_Execute_Async(query_ChangePKs);
            if (!r) {
                throw new Error(`Cannot change table '${alterInfo.tableDef.name}'` +
                    ` pks '${pks_Str}'.`);
            }
            abLog.success(`  changed PKs: ${pks_Str}`);
        }
        /* / Primary Keys */

        for (let indexName of alterInfo.indexes_Delete) {
            let query_DeleteIndex = `ALTER TABLE ${alterInfo.tableDef.name}` +
                ` DROP INDEX \`${indexName}\``;
            let r = await db.query_Execute_Async(query_DeleteIndex);
            if (!r) {
                throw new Error(`Cannot drop table '${alterInfo.tableDef.name}'` +
                    ` index '${indexName}'.`);
            }

            abLog.success(`  deleted: ${indexName}`);
        }

        for (let indexName in alterInfo.indexes_Create) {
            let query_CreateIndex = `ALTER TABLE ${alterInfo.tableDef.name}` +
                    ` ADD INDEX \`${indexName}\``;
            let indexColumnsArr = [];
            for (let indexColumn of alterInfo.indexes_Create[indexName]) {
                let descStr = indexColumn.desc ? 'DESC' : 'ASC';
                indexColumnsArr.push(`\`${indexColumn.name}\` ${descStr}`);
            }
            query_CreateIndex += ` (` + indexColumnsArr.join(',') + `)`;
            let r = await db.query_Execute_Async(query_CreateIndex);
            if (!r) {
                throw new Error(`Cannot add table '${alterInfo.tableDef.name}'` +
                        ` index '${indexName}'.`);
            }

            abLog.success(`  created: ${indexName}`);
            for (let indexColumn of alterInfo.indexes_Create[indexName]) {
                abLog.success(`    - ${indexColumn.name} ` + 
                        (indexColumn.desc ? 'DESC' : 'ASC'));
            }
        }
    }
    /* / Indexes */

    db.disconnect();
}

async function createDatabaseInfo_Async(db          )                        {
    let dbVer = new DatabaseVersion('mysql', [ 0, 0, 1 ])
    let databaseInfo = new DatabaseInfo(dbVer);

    let result_ShowTables = await db.query_Select_Async('SHOW TABLES;');
    for (let row of result_ShowTables) {
        let tableName = row[Object.keys(row)[0]]          ;

        let tableInfo = new TableInfo(tableName);

        let result_Table = await db.query_Select_Async(
                `DESC \`${tableInfo.name}\`;`);
        for (let row of result_Table) {
            tableInfo.addFieldInfo(new FieldInfo(
                row.Field          ,
                (row.Type          ).toLowerCase(),
                row.Null === 'NO',
                row.Extra          ,
            ));
        }

        let result_TableIndexes = await db.query_Select_Async(
                `SHOW INDEX FROM \`${tableInfo.name}\`;`);
        let pks                = [];
        let indexInfos                                   = {};
        for (let row of result_TableIndexes) {
            let indexName = row.Key_name          ;

            if (indexName === 'PRIMARY') {
                pks.push(row.Column_name          );
                continue;
            }

            if (!(indexName in indexInfos))
                indexInfos[indexName] = new IndexInfo();

            indexInfos[indexName].addColumnInfo(row.Seq_in_index          , 
                    row.Column_name          , row.Collation === 'D');
        }

        tableInfo.setPKs(pks);

        for (let indexName in indexInfos)
            tableInfo.addIndexInfo(indexName, indexInfos[indexName]);

        databaseInfo.addTableInfo(tableInfo);
    }

    return databaseInfo;
}

;                           
                 

                         
                              
  

