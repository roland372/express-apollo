export {};

declare module 'express' {
	export interface Response {
		url: string;
		user: string;
	}

	export interface Request {
		session: string;
		user: string;
	}
}

// declare global {
// 	namespace Express {
// 		interface Response {
// 			url: string;
// 		}
// 	}
// }
