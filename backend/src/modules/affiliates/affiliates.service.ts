import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import limit from 'src/constants/limit';
import DatabaseService from 'src/services/database/database.service';
import EmailService from 'src/services/Email/email.service';

@Injectable()
export class AffiliatesService {
  private readonly emailService = new EmailService();
  constructor(private readonly database: DatabaseService) {}
  public async create(productId: string, userId: string) {
    const [product, user, afiliation] = await Promise.all([
      this.database.products.findFirst({
        where: {
          id: productId,
        },
      }),
      this.database.users.findFirst({
        where: {
          id: userId,
          role: {
            not: 'ADMIN',
          },
        },
      }),
      this.database.afiliates.findFirst({
        where: {
          productId,
          userId,
        },
      }),
    ]);

    if (afiliation) {
      throw new ConflictException('Afiliação existente');
    }
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (product?.userId == user.id) {
      throw new ConflictException('Esse produto é seu');
    }
    const [newAfiliation] = await this.database.$transaction([
      this.database.afiliates.create({
        data: {
          userId,
          productId,
          link: `${product.link}?aff=${user.id}`,
        },
      }),
      this.database.users.update({
        data: {
          totalAfiliations: {
            increment: 1,
          },
        },
        where: {
          id: userId,
        },
      }),
    ]);

    const emailSubject = 'Nova Afiliação Criada';
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Nova Afiliação Criada</h1>
              </div>
              <div class="content">
                  <p>Olá <strong>${user.name}</strong>,</p>
                  <p>Sua afiliação para o produto <strong>${product.title}</strong> foi criada com sucesso!</p>
                  <p><strong>Seu link de afiliado:</strong></p>
                  <p><a href="${newAfiliation.link}" class="button">Acessar Link de Afiliado</a></p>
                  <p><strong>Link:</strong> ${newAfiliation.link}</p>
                  <p>Você pode começar a compartilhar este link imediatamente e ganhar comissões por cada venda realizada através dele.</p>
              </div>
              <div class="footer">
                  <p>Este é um email automático, por favor não responda.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    try {
      await this.emailService.senEmail({
        to: user.email,
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error(
        'Erro ao enviar email de criação de afiliação:',
        emailError,
      );
    }

    return {
      message: 'Afiliação criada com sucesso',
      data: newAfiliation,
    };
  }
  async findAll(userId: string) {
    const [user, afiliation] = await Promise.all([
      this.database.users.findFirst({
        where: {
          id: userId,
          role: {
            not: 'ADMIN',
          },
        },
      }),
      this.database.afiliates.findMany({
        where: {
          userId,
        },
        include: {
          product: {
            include: {
              user: {
                omit: {
                  password: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            totalPurchases: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
      }),
    ]);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return {
      data: afiliation,
    };
  }
  async remove(id: number, requestingUserId: string) {
    const afiliation = await this.database.afiliates.findFirst({
      where: { id },
      include: {
        user: true,
        product: true,
      },
    });

    if (!afiliation) {
      throw new NotFoundException('Afiliação não encontrada');
    }

    const requestingUser = await this.database.users.findFirst({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const canRemove =
      requestingUser.role === 'ADMIN' || afiliation.userId === requestingUserId;

    if (!canRemove) {
      throw new ConflictException(
        'Você não tem permissão para remover esta afiliação',
      );
    }

    const [deletedAfiliation] = await this.database.$transaction([
      this.database.afiliates.delete({
        where: { id },
      }),
      this.database.users.update({
        where: { id: afiliation.userId },
        data: {
          totalAfiliations: {
            decrement: 1,
          },
        },
      }),
    ]);

    const emailSubject = 'Afiliação Removida';
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f44336; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Afiliação Removida</h1>
              </div>
              <div class="content">
                  <p>Olá <strong>${afiliation.user.name}</strong>,</p>
                  <p>Sua afiliação para o produto <strong>${afiliation.user.name}</strong> foi removida.</p>
                  <p><strong>Removido por:</strong> ${afiliation.user.name} (${afiliation.user.role})</p>
                  <p><strong>Data da remoção:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                  <p>Se você acredita que esta remoção foi um erro, entre em contato com nosso suporte.</p>
              </div>
              <div class="footer">
                  <p>Este é um email automático, por favor não responda.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    try {
      await this.emailService.senEmail({
        to: afiliation.user.email,
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error(
        'Erro ao enviar email de remoção de afiliação:',
        emailError,
      );
      // Não lançar erro para não quebrar o fluxo principal
    }

    return {
      message: 'Afiliação removida com sucesso',
      data: deletedAfiliation,
    };
  }
  async getProductsToAfiliate(userId: string, page: number = 1) {
    const [product, total] = await Promise.all([
      this.database.afiliates.findMany({
        where: {
          userId: {
            not: userId,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          product: {
            include: {
              user: {
                omit: {
                  password: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            totalPurchases: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
      }),
      this.database.afiliates.count({
        where: {
          userId: {
            not: userId,
          },
        },
      }),
    ]);
    const lastPage = total == 0 ? 0 : Math.ceil(total / limit);
    return {
      page,
      data: product,
      lastPage,
    };
  }
}
