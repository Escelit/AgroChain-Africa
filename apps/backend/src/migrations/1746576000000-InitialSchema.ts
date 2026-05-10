import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1746576000000 implements MigrationInterface {
  name = 'InitialSchema1746576000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'farmers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'stellarPublicKey', type: 'varchar', isUnique: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'nationalIdHash', type: 'varchar', isNullable: true },
          { name: 'fullName', type: 'varchar', isNullable: true },
          { name: 'countryCode', type: 'varchar', length: '2', default: "'KE'" },
          { name: 'onChainCreditScore', type: 'int', default: 0 },
          { name: 'kycVerified', type: 'boolean', default: false },
          { name: 'kycVerifiedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'harvests',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'stellarBatchId', type: 'varchar', isNullable: true },
          { name: 'commodity', type: 'varchar' },
          { name: 'grade', type: 'varchar' },
          { name: 'weightKg', type: 'decimal', precision: 10, scale: 2 },
          { name: 'locationGeohash', type: 'varchar' },
          { name: 'harvestDate', type: 'timestamp' },
          { name: 'moistureContent', type: 'decimal', isNullable: true },
          { name: 'estimatedValueUsdc', type: 'decimal', isNullable: true },
          { name: 'status', type: 'enum', enum: ['DRAFT','TOKENIZED','LISTED','PLEDGED','DELIVERED','SETTLED','DISPUTED'], default: "'DRAFT'" },
          { name: 'txHash', type: 'varchar', isNullable: true },
          { name: 'farmerId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [{ columnNames: ['farmerId'], referencedTableName: 'farmers', referencedColumnNames: ['id'] }],
      }),
      true,
    );

    await queryRunner.createIndex('harvests', new TableIndex({ name: 'IDX_HARVEST_FARMER', columnNames: ['farmerId'] }));
    await queryRunner.createIndex('harvests', new TableIndex({ name: 'IDX_HARVEST_STATUS', columnNames: ['status'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('harvests');
    await queryRunner.dropTable('farmers');
  }
}
