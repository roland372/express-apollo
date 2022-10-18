export {};

declare module 'express' {
	export interface Response {
		url: string;
	}
	export interface Request {
		session: string;
	}
}

// declare global {
// 	namespace Express {
// 		interface Response {
// 			url: string;
// 		}
// 	}
// }
