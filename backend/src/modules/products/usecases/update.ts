import { Logger } from '@nestjs/common';
import {
  EditProductChekoutDTO,
  UpdateProductDTO,
  UpdateProductFiles,
  UpdateProductPaymentDTO,
} from '../dto/create-product.dto';
import DatabaseService from 'src/services/database/database.service';
import { Status } from 'generated/prisma';
import IsActiveUser from 'src/interceptors/isActiveUser';
import { isValidFile } from 'src/lib/util';
import EmailService from 'src/services/Email/email.service';
export default class ProductUpdater {
  private readonly logger = new Logger('ProductUpdater');
  private readonly isActive: IsActiveUser;
  private readonly email = new EmailService();
  constructor(private readonly database: DatabaseService) {
    this.isActive = new IsActiveUser(this.database);
  }
  public async UpdateProduct(data: UpdateProductDTO, userId: string) {
    try {
      const [User, Product] = await Promise.all([
        this.database.users.findUnique({ where: { id: userId } }),
        this.database.products.findUnique({
          where: {
            id: data.productId,
          },
        }),
      ]);

      if (User && Product && User.id == Product.userId) {
        const updatedProduct = await this.database.products.update({
          where: {
            id: Product.id,
          },
          data: {
            status:
              Product.file && Product.whatsappSuport ? 'APROVED' : 'PENDING',
            backredirect: data.backRedirect,
            upsell: data.UpSell,
            category: data.category,
            type: data.type,
            description: data.description,
            garant: data.garant,
            orderbumps: data.orderBump,
            whatsappSuport: data.whatsapp,
            pixelId: data.pixelId,
            title: data.title,
            price: data.price,
            percentShare: data.percent,
          },
        });
        return {
          message: updatedProduct?.id
            ? 'Produto actualizado com sucesso'
            : 'Erro ao actualizar',
          updated: updatedProduct?.id ? true : false,
        };
      }
      return {
        message: 'Produto não encontrado',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o produto',
      );
      return {
        message: 'Erro ao Editar o produto',
      };
    }
  }
  public async UpdateProductPayments(
    data: UpdateProductPaymentDTO,
    userId: string,
  ) {
    try {
      if (data.payments.length > 3 || data.payments.length == 0) {
        return {
          message: 'Método de pagamento inválido',
        };
      }
      const [User, Product] = await Promise.all([
        this.database.users.findUnique({ where: { id: userId } }),
        this.database.products.findUnique({
          where: {
            id: data.productId,
          },
        }),
      ]);
      if (User && Product && User.id == Product.userId) {
        const updatedProduct = await this.database.products.update({
          where: {
            id: Product.id,
          },
          data: {
            payment: data.payments,
          },
        });
        return {
          message: updatedProduct?.id
            ? 'Produto actualizado com sucesso'
            : 'Erro ao actualizar',
          updated: updatedProduct?.id ? true : false,
        };
      }
      return {
        message: 'Produto não encontrado',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o produto',
      );
      return {
        message: 'Erro ao Editar o produto',
      };
    }
  }
  public async UpdatePrductStatus(productid: string, status: Status) {
    try {
      const [updatedProduct] = await Promise.all([
        this.database.products.update({
          where: {
            id: productid,
          },
          data: {
            status,
          },
          include: {
            user: true,
          },
        }),
      ]);
      const user = updatedProduct?.user;

      if (user) {
        const user = updatedProduct?.user;

        if (user) {
          const isApproved = status == 'APROVED';
          await this.email.senEmail({
            html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isApproved ? 'Produto Aprovado' : 'Produto Reprovado'} - Culonga</title>
  <style>
    :root {
      --success: #10B981;
      --success-light: #ECFDF5;
      --error: #EF4444;
      --error-light: #FEF2F2;
      --primary: #7C3AED;
      --primary-dark: #6D28D9;
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --text: #1E293B;
      --text-muted: #64748B;
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      background: var(--bg); 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      color: var(--text); 
      line-height: 1.6;
    }
    
    .container { 
      max-width: 500px; 
      margin: 40px auto; 
      background: var(--card); 
      border-radius: 20px; 
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); 
      overflow: hidden;
    }
    
    .header { 
      padding: 30px; 
      background: linear-gradient(135deg, var(--primary), var(--primary-dark)); 
      color: white; 
      text-align: center; 
    }
    
    .logo { 
      font-size: 28px; 
      font-weight: 800; 
      margin-bottom: 8px;
    }
    
    .content { 
      padding: 40px 30px; 
      text-align: center; 
    }
    
    .status-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
      font-size: 32px;
      background: ${isApproved ? 'var(--success-light)' : 'var(--error-light)'};
      border: 3px solid ${isApproved ? 'var(--success)' : 'var(--error)'};
      color: ${isApproved ? 'var(--success)' : 'var(--error)'};
    }
    
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: ${isApproved ? 'var(--success)' : 'var(--error)'};
    }
    
    .product-card {
      background: #F8FAFC;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
      border-left: 4px solid var(--primary);
    }
    
    .product-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }
    
    .product-info {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 5px;
    }
    
    .message-box {
      background: ${isApproved ? 'var(--success-light)' : 'var(--error-light)'};
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid ${isApproved ? 'var(--success)' : 'var(--error)'};
    }
    
    .message-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: ${isApproved ? 'var(--success)' : 'var(--error)'};
    }
    
    .next-steps {
      background: #F0F9FF;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
    }
    
    .next-steps-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .step-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .step-text {
      font-size: 14px;
      color: var(--text-muted);
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white !important;
      padding: 14px 32px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
    
    .support {
      background: #FFFBEB;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid #F59E0B;
    }
    
    .support-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #D97706;
    }
    
    .footer { 
      padding: 25px; 
      text-align: center; 
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      color: var(--text-muted);
      font-size: 12px;
    }
    
    @media (max-width: 600px) {
      .container { margin: 20px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🛍️ Culonga</div>
      <div>Sua plataforma de vendas digital</div>
    </div>
    
    <div class="content">
      <div class="status-icon">
        ${isApproved ? '✅' : '❌'}
      </div>
      
      <h1 class="title">
        ${isApproved ? 'Produto Aprovado!' : 'Produto Reprovado'}
      </h1>
      
      <p>Olá, <strong>${user.name}</strong>!</p>
      
      <div class="product-card">
        <div class="product-name">${updatedProduct.title}</div>
        <div class="product-info">
          <strong>Preço:</strong> ${Number(updatedProduct.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
        <div class="product-info">
          <strong>Categoria:</strong> ${updatedProduct.category}
        </div>
        <div class="product-info">
          <strong>Data de submissão:</strong> ${new Date(updatedProduct.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
      
      <div class="message-box">
        <div class="message-title">
          ${isApproved ? '🎉 Parabéns!' : '📝 Atenção necessária'}
        </div>
        <p>
          ${
            isApproved
              ? 'Seu produto foi aprovado pela nossa equipe e já está disponível para venda na plataforma!'
              : 'Seu produto não atendeu aos nossos requisitos de qualidade. Verifique nossas diretrizes e faça os ajustes necessários.'
          }
        </p>
      </div>
      
      <div class="next-steps">
        <div class="next-steps-title">🚀 ${isApproved ? 'Próximos Passos' : 'O que fazer agora?'}</div>
        
        ${
          isApproved
            ? `
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-text">Seu produto está visível para todos os compradores</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">Monitore suas vendas pelo painel de controle</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">Compartilhe seu produto nas redes sociais</div>
          </div>
        `
            : `
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-text">Revise as diretrizes de qualidade da plataforma</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">Faça os ajustes necessários no produto</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">Reenvie o produto para nova análise</div>
          </div>
        `
        }
      </div>
      
      ${
        isApproved
          ? `
        <a href="https://app.culonga.com/dashboard/products" class="cta-button">
          📊 Ver Meus Produtos
        </a>
      `
          : `
        <a href="https://app.culonga.com/guidelines" class="cta-button">
          📖 Ver Diretrizes
        </a>
      `
      }
      
      <div class="support">
        <div class="support-title">💬 Precisa de ajuda?</div>
        <p style="margin: 0; font-size: 14px;">
          Nossa equipe está aqui para te auxiliar!<br>
          <a href="mailto:suporte@culonga.com" style="color: #D97706; font-weight: 500;">
            suporte@culonga.com
          </a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <div>© 2025 Culonga • Transformando vendas digitais</div>
      <div style="margin-top: 8px; opacity: 0.7;">
        Este é um email automático, por favor não responda.
      </div>
    </div>
  </div>
</body>
</html>`,
            subject: isApproved
              ? '🎉 Produto Aprovado - Culonga'
              : '📝 Produto Reprovado - Culonga',
            to: user.email,
          });
        }
      }
      return {
        message: updatedProduct?.id
          ? 'Produto actualizado'
          : 'Producto não encontrado',
        updated: updatedProduct?.id ? true : false,
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o produto',
      );
      return {
        message: 'Erro ao Editar o produto',
      };
    }
  }
  public async UpdateProductChekout(
    data: EditProductChekoutDTO,
    userid: string,
  ) {
    try {
      const isAvtive = await this.isActive.isActive(userid);
      if (!isAvtive) {
        return {
          message: 'Sua conta foi banida',
        };
      }
      const Product = await this.database.products.findUnique({
        where: { id: data.id, userId: userid },
      });
      if (Product) {
        const updatedChekout = await this.database.productCheckout.update({
          where: {
            productId: Product.id,
          },
          data: {
            bg: data.bg,
            textColor: data.textColor,
            btn: JSON.stringify(data.btn),
            orderbump: JSON.stringify(data.orderbump),
            timer: JSON.stringify(data.timer),
          },
        });
        return {
          message: updatedChekout?.id
            ? 'Checkout actualizado'
            : 'Erro ao actualizar',
          updated: updatedChekout?.id ? true : false,
        };
      }
      return {
        message: 'Producto não encontrado',
      };
    } catch (error) {
      this.logger.log(
        error?.message ?? error?.error ?? error ?? 'Erro ao Editar o chekout',
      );
      return {
        message: 'Erro ao Editar o chekout',
      };
    }
  }
}
