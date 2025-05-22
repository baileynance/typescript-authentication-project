export class Account {
    constructor(public firstName: string, public lastName: number, public email: string, private password: string) {
        this.firstName = firstName
        this.lastName = lastName
        this.email = email
        this.password = password
    }
  
    
}