import DatabaseService from 'src/services/database/database.service';

export default class IsActiveUser {
  constructor(private readonly database: DatabaseService) {}
  public async isActive(userId: string) {
    try {
      const User = await this.database.users.findUnique({
        where: {
          id: userId,
          status: {
            notIn : ["BANED" , "CANCELED" , "REJECTED"]
          }
        },
      });

      return User && User.id ? true : false;
    } catch (error) {
      return false;
    }
  }
}
