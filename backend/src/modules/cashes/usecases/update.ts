
import DatabaseService from 'src/services/database/database.service';
import EmailService from 'src/services/Email/email.service';

export default async function AproveWidrall(
  id: string,
  database: DatabaseService,
  status: '1' | '0',
  file: string,
) {
  try {
    const Withdrawal = await database.withdrawal.findUnique({
      where: {
        id,
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            lastname: true,
            availableBalance: true,
            totalEarned: true,
          },
        },
        id: true,
        bank: true,
        amount: true,
        status: true,
        iban: true,
      },
    });
    if (Withdrawal) {
      if (status == '0') {
        await database.withdrawal.update({
          data: {
            status: 'REJECTED',
            fileURL: '',
          },
          where: {
            id: Withdrawal.id,
          },
        });
        return {
          sent: true,
          message: 'Saque  rejeitado',
        };
      } else {
        const [updatedWithdrawal, updatedUser] = await Promise.all([
          database.withdrawal.update({
            data: {
              fileURL: file,
              status: 'APROVED',
            },
            where: {
              id: Withdrawal.id,
            },
          }),
          database.users.update({
            data: {
              availableBalance:
                Withdrawal.user.availableBalance - Withdrawal.amount,
            },
            where: {
              id: Withdrawal.user.id,
            },
          }),
        ]);
        await Promise.all([
          new EmailService().senEmail({
            to: updatedUser.email,
            subject: 'Saque Aprovado com sucesso',
            html: `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Saque confirmado</title>
    <style>
      /* Apenas fallback para clientes que suportam <style>*/
      .btn:hover { opacity: .9; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f6f7f9;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7f9;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e9ecf1;">
            <!-- Header -->
            <tr>
              <td style="background:#0d1117;padding:20px 24px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:18px;font-weight:700;">kulonga</div>
                <div style="font-size:12px;opacity:.9;">Confirmação de Saque</div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                <p style="margin:0 0 12px 0;font-size:16px;">
                  Olá ${updatedUser.name + ' ' + updatedUser.lastname},
                </p>
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
                  Seu <strong>saque</strong> foi processado com sucesso.
                  Abaixo estão os detalhes da transferência:
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 8px;">
                  <tr>
                    <td style="font-size:13px;color:#6b7280;width:40%;">ID do Saque</td>
                    <td style="font-size:14px;color:#111827;"><strong> ${Withdrawal.id} </strong></td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;">Status</td>
                    <td style="font-size:14px;color:#0b7a0b;">APROVADO</strong></td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;">Data/Hora</td>
                    <td style="font-size:14px;">${new Date().toLocaleDateString('pt')}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;">Montante</td>
                    <td style="font-size:16px;"><strong> ${Number(Withdrawal.amount).toLocaleString('pt')} kz </strong></td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;">Banco</td>
                    <td style="font-size:14px;">  ${Withdrawal.bank} </td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b7280;">IBAN</td>
                    <td style="font-size:14px;"> ${Withdrawal.iban}</td>
                  </tr>
                </table>

                <!-- Callout -->
                <div style="margin:18px 0 8px 0;padding:12px 14px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;color:#374151;font-size:13px;line-height:1.6;">
                  Guarde este e-mail como comprovante. Caso identifique algum dado incorreto, entre em contato com nosso suporte.
                </div>

                <!-- Button -->
                <div style="margin-top:16px;">
                  <a href="app.kulonga.com" class="btn"
                     style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 14px;border-radius:8px;font-size:14px;">
                    Ver no painel
                  </a>
                </div>

                <p style="margin:18px 0 0 0;font-size:12px;color:#6b7280;line-height:1.6;">
                  Se você não reconhece esta operação, notifique-nos imediatamente: <a href="mailto:suporte@kulonga.com" style="color:#0ea5e9;text-decoration:none;">suporte@kulonga.com</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;">
                kulonga<br />
                Este é um e-mail automático. Por favor, não responda.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
          }),
        ]);
        return {
          sent: true,
          message: 'Saque  aprovado',
        };
      }
     
    }
    return {
      sent: false,
      message: 'Pedido de saque não encontrado',
    };
  } catch (error) {
    return {
      sent: false,
      message: 'Pedido de saque não encontrado',
    };
  }
}
