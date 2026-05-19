export class Notification{
    id!:string;
    token!: string;
    userId!: string;
    title!: string;
    body!: string;
    isRead: boolean = false;
}