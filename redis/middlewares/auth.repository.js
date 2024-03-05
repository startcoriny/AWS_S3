import { prisma } from "../utils/prisma/index.js";

export class AuthRepository {
  findById = async (id) => {
    const user = await prisma.users.findFirst({
      where: {
        id: +id,
      },
    });
    return user;
  };
}
