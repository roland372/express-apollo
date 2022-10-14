export {};

declare module 'express' {
	export interface Response {
		url: string;
	}
}

// declare global {
// 	namespace Express {
// 		interface Response {
// 			url: string;
// 		}
// 	}
// }
