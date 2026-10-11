import bcrypt from "bcryptjs";
import { RegistrationPayload, User } from "../types";
import { hashPassword } from "../utils";
import prisma from "../config/prisma";
import { localStore } from "../config/localStore";
import { isUsingPostgres } from "../config/dbConnection";

export const createUser = async (
  userData: RegistrationPayload
): Promise<User> => {
  if (!isUsingPostgres()) {
    return await localStore.createUser(userData);
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword
    }
  });

  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  if (!isUsingPostgres()) {
    return localStore.findUserByEmail(email);
  }

  return await prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: number) => {
  if (!isUsingPostgres()) {
    return localStore.findUserById(id);
  }

  return await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true
    }
  });
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
) => await bcrypt.compare(plainPassword, hashedPassword);
