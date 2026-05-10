import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class EscrowAndPayments1746662400000 implements MigrationInterface {
  name = 'EscrowAndPayments1746662400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'escrow_contracts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'stellarContractId', type: 'varchar', isNullable: true },
          { name: 'buyerPublicKey', type: 'varchar' },
          { name: 'buyerName', type: 'varchar', isNullable: true },
          { name: 'amountUsdc', type: 'decimal', precision: 18, scale: 7 },
          { name: 'status', type: 'enum', enum: ['PENDING','FUNDED','DELIVERED','RELEASED','DISPUTED','REFUNDED','EXPIRED'], default: "'PENDING'" },
          { name: 'expectedWeightKg', type: 'decimal', isNullable: true },
          { name: 'expiryDate', type: 'timestamp', isNullable: true },
          { name: 'deliveryConfirmedAt', type: 'timestamp', isNullable: true },
          { name: 'disputeReason', type: 'varchar', isNullable: true },
          { name: 'fundTxHash', type: 'varchar', isNullable: true },
          { name: 'releaseTxHash', type: 'varchar', isNullable: true },
          { name: 'harvestId', type: 'uuid' },
          { name: 'farmerId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          { columnNames: ['harvestId'], referencedTableName: 'harvests', referencedColumnNames: ['id'] },
          { columnNames: ['farmerId'], referencedTableName: 'farmers', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'type', type: 'enum', enum: ['ESCROW_RELEASE','LOAN_DISBURSEMENT','LOAN_REPAYMENT','ANCHOR_WITHDRAWAL'] },
          { name: 'status', type: 'enum', enum: ['PENDING','COMPLETED','FAILED'], default: "'PENDING'" },
          { name: 'amountUsdc', type: 'decimal', precision: 18, scale: 7 },
          { name: 'stellarTxHash', type: 'varchar', isNullable: true },
          { name: 'anchorTransactionId', type: 'varchar', isNullable: true },
          { name: 'mobileNumber', type: 'varchar', isNullable: true },
          { name: 'memo', type: 'varchar', isNullable: true },
          { name: 'farmerId', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [{ columnNames: ['farmerId'], referencedTableName: 'farmers', referencedColumnNames: ['id'] }],
      }),
      true,
    );

    await queryRunner.createIndex('escrow_contracts', new TableIndex({ name: 'IDX_ESCROW_FARMER', columnNames: ['farmerId'] }));
    await queryRunner.createIndex('payments', new TableIndex({ name: 'IDX_PAYMENT_FARMER', columnNames: ['farmerId'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
    await queryRunner.dropTable('escrow_contracts');
  }
}
