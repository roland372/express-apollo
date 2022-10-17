import { NextFunction, Request, Response } from 'express';

export type TReqRes = (req: Request, res: Response, next: NextFunction) => void;
