import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class LoansTable1746748800000 implements MigrationInterface {
  name = 'LoansTable1746748800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'loans',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'stellarLoanId', type: 'varchar', isNullable: true },
          { name: 'lenderPublicKey', type: 'varchar' },
          { name: 'principalUsdc', type: 'decimal', precision: 18, scale: 7 },
          { name: 'repaidUsdc', type: 'decimal', precision: 18, scale: 7, default: 0 },
          { name: 'interestBps', type: 'int' },
          { name: 'durationDays', type: 'int' },
          { name: 'dueDate', type: 'timestamp' },
          { name: 'status', type: 'enum', enum: ['ACTIVE','REPAID','DEFAULTED','LIQUIDATED'], default: "'ACTIVE'" },
          { name: 'harvestId', type: 'uuid' },
          { name: 'farmerId', type: 'uuid' },
          { name: 'disburseTxHash', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          { columnNames: ['farmerId'], referencedTableName: 'farmers', referencedColumnNames: ['id'] },
          { columnNames: ['harvestId'], referencedTableName: 'harvests', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('loans', new TableIndex({ name: 'IDX_LOAN_FARMER', columnNames: ['farmerId'] }));
    await queryRunner.createIndex('loans', new TableIndex({ name: 'IDX_LOAN_LENDER', columnNames: ['lenderPublicKey'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('loans');
  }
}
