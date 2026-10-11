import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export const mockRequest = (overrides: Partial<AuthRequest> = {}): AuthRequest => {
  return {
    params: {},
    query: {},
    body: {},
    ...overrides
  } as AuthRequest;
};

export const mockResponse = (): Response => {
  const res = {} as Response;

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);

  return res;
};

export const mockNext: NextFunction = jest.fn();
