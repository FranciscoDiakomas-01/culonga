import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import DatabaseService from '../database/database.service';
import EmailService from '../Email/email.service';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  private emailService = new EmailService();
  constructor(private readonly database: DatabaseService) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async handleCronEvery5Min() {
    this.logger.debug('Deleting all Canceled Payments');
    const deleted = await this.database.payment.deleteMany({
      where: {
        OR: [
          {
            status: 'CANCELED',
          },
          {
            status: 'REJECTED',
          },
        ],
      },
    });
    this.logger.debug(`Deleted ${deleted.count} Canceled Payments`);
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async deleterInactiveProducts() {
    this.logger.debug('Deleting all Canceled Products');
    const deleted = await this.database.products.deleteMany({
      where: {
        OR: [
          {
            status: 'CANCELED',
          },
          {
            status: 'REJECTED',
          },
        ],
      },
    });
    this.logger.debug(`Deleted ${deleted.count} Canceled Products`);
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async deleteInactiveSaques() {
    this.logger.debug('Deleting all Canceled withdrawal');
    const deleted = await this.database.withdrawal.deleteMany({
      where: {
        OR: [
          {
            status: 'CANCELED',
          },
          {
            status: 'REJECTED',
          },
        ],
      },
    });
    this.logger.debug(`Deleted ${deleted.count} Canceled withdrawal`);
  }
  @Cron(CronExpression.EVERY_WEEKEND)
  async handleWeeklyReport() {
    try {
      this.logger.debug('Iniciando relatório semanal da plataforma...');

      // Buscar dados em paralelo para melhor performance
      const [totalPlataforma, totalUltimos7Dias, admin] = await Promise.all([
        this.database.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'APROVED' },
        }),
        this.database.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'APROVED',
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              lte: new Date(),
            },
          },
        }),
        this.database.users.findFirst({
          where: {
            role: 'ADMIN',
          },
        }),
      ]);

      if (!admin) {
        this.logger.debug('Admin não encontrado');

        return;
      }
      const totalGanhoPlataforma = (totalPlataforma._sum.amount || 0) * 0.08;
      const ganhoUltimos7Dias = (totalUltimos7Dias._sum.amount || 0) * 0.08;

      // Formatar valores
      const formatCurrency = (value: number) =>
        value.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' });

      const emailBody = this.generateWeeklyReportEmail({
        totalPlataforma: totalPlataforma._sum.amount || 0,
        totalGanhoPlataforma,
        totalUltimos7Dias: totalUltimos7Dias._sum.amount || 0,
        ganhoUltimos7Dias,
        formatCurrency,
      });

      await this.emailService.senEmail({
        to: admin.email,
        subject: '📊 Relatório Semanal - Culonga',
        html: emailBody,
      });

      this.logger.debug('Relatório semanal enviado com sucesso.');
    } catch (error) {
      this.logger.error('Erro ao gerar relatório semanal: ', error);
    }
  }
  private generateWeeklyReportEmail(data: {
    totalPlataforma: number;
    totalGanhoPlataforma: number;
    totalUltimos7Dias: number;
    ganhoUltimos7Dias: number;
    formatCurrency: (value: number) => string;
  }): string {
    const {
      totalPlataforma,
      totalGanhoPlataforma,
      totalUltimos7Dias,
      ganhoUltimos7Dias,
      formatCurrency,
    } = data;

    const periodo = new Date().toLocaleDateString('pt-AO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log(data);

    return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Semanal - Culonga</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8fafc;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 16px;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .stat-card.highlight {
      background: linear-gradient(135deg, #fed7e2 0%, #fbb6ce 100%);
      border-left-color: #e53e3e;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #4a5568;
      font-weight: 500;
    }
    
    .comparison {
      background: #f0fff4;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #9ae6b4;
    }
    
    .comparison-title {
      font-size: 16px;
      font-weight: 600;
      color: #22543d;
      margin-bottom: 10px;
    }
    
    .footer {
      background: #2d3748;
      color: #cbd5e0;
      padding: 20px;
      text-align: center;
      font-size: 14px;
    }
    
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    
    .periodo {
      text-align: center;
      color: #718096;
      font-size: 14px;
      margin-bottom: 20px;
      font-style: italic;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .metric:last-child {
      border-bottom: none;
    }
    
    .metric-label {
      color: #4a5568;
    }
    
    .metric-value {
      font-weight: 600;
      color: #2d3748;
    }
    
    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .content {
        padding: 20px;
      }
      
      .header {
        padding: 20px 15px;
      }
      
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório Semanal</h1>
      <p>Culonga - Plataforma de Afiliados</p>
    </div>
    
    <div class="content">
      <div class="periodo">
        Período: ${periodo}
      </div>
      
      <div class="section">
        <h2 class="section-title">📈 Visão Geral da Plataforma</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(totalPlataforma)}</div>
            <div class="stat-label">Volume Total da Plataforma</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-value">${formatCurrency(totalGanhoPlataforma)}</div>
            <div class="stat-label">Ganhos Totais (8%)</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">🕐 Desempenho da Semana</h2>
        <div class="comparison">
          <div class="comparison-title">Últimos 7 Dias</div>
          <div class="metric">
            <span class="metric-label">Volume de Vendas:</span>
            <span class="metric-value">${formatCurrency(totalUltimos7Dias)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Ganhos da Plataforma:</span>
            <span class="metric-value">${formatCurrency(ganhoUltimos7Dias)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Taxa de Comissão:</span>
            <span class="metric-value">8%</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">📋 Resumo Executivo</h2>
        <div style="background: #edf2f7; padding: 15px; border-radius: 8px;">
          <p style="margin-bottom: 10px;">✅ <strong>Performance:</strong> A plataforma continua gerando receita consistente.</p>
          <p style="margin-bottom: 10px;">💰 <strong>Lucratividade:</strong> Taxa de 8% mantém a sustentabilidade do negócio.</p>
          <p>📈 <strong>Perspectiva:</strong> Crescimento contínuo nas transações.</p>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Culonga. Todos os direitos reservados.</p>
      <p>Este é um relatório automático gerado pelo sistema.</p>
      <p><a href="https://culonga.com">Acessar Painel Administrativo</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  onModuleInit() {
    this.logger.debug('CRINJOB --> loaded');
  }
}
