class TokenContract {
    private balances: Map<string, number>;
  
    constructor() {
      this.balances = new Map();
    }
  
    // Mocked transfer method
    transfer(sender: string, receiver: string, amount: number): void {
      const senderBalance = this.balances.get(sender) || 0;
      const receiverBalance = this.balances.get(receiver) || 0;
  
      if (senderBalance < amount) {
        throw new Error('Insufficient balance');
      }
  
      this.balances.set(sender, senderBalance - amount);
      this.balances.set(receiver, receiverBalance + amount);
    }
  
    // Mocked balanceOf method
    balanceOf(account: string): number {
      return this.balances.get(account) || 0;
    }
  
    // Mock method to set initial balance for an account
    setBalance(account: string, balance: number): void {
      this.balances.set(account, balance);
    }
  }
  
  describe('TokenContract', () => {
    let tokenContract: TokenContract;
  
    beforeEach(() => {
      tokenContract = new TokenContract();
    });
  
    describe('transfer', () => {
      it('should transfer tokens from one account to another', () => {
        const sender = 'sender_account';
        const receiver = 'receiver_account';
        tokenContract.setBalance(sender, 1000);
  
        tokenContract.transfer(sender, receiver, 100);
  
        expect(tokenContract.balanceOf(sender)).toBe(900);
        expect(tokenContract.balanceOf(receiver)).toBe(100);
      });
  
      it('should throw an error when sender has insufficient balance', () => {
        const sender = 'sender_account';
        const receiver = 'receiver_account';
        tokenContract.setBalance(sender, 50);
  
        expect(() => tokenContract.transfer(sender, receiver, 100)).toThrowError('Insufficient balance');
      });
    });
  
    describe('balanceOf', () => {
      it('should return the correct balance of an account', () => {
        const account = 'account_1';
        tokenContract.setBalance(account, 1000);
  
        const balance = tokenContract.balanceOf(account);
  
        expect(balance).toBe(1000);
      });
  
      it('should return 0 for an account with no tokens', () => {
        const account = 'account_2';
  
        const balance = tokenContract.balanceOf(account);
  
        expect(balance).toBe(0);
      });
    });
  });
  

// import { TokenContract } from '../typescript/kcash_fungible_asset'; // Import your TokenContract class

// describe('TokenContract', () => {
//   let tokenContract: TokenContract;

//   beforeEach(() => {
//     // Initialize a new instance of the TokenContract before each test
//     tokenContract = new TokenContract();
//   });

//   describe('transfer', () => {
//     it('should transfer tokens from one account to another', () => {
//       // Arrange
//       const sender = 'sender_account';
//       const receiver = 'receiver_account';
//       const amount = 100;

//       // Act
//       tokenContract.transfer(sender, receiver, amount);

//       // Assert
//       expect(tokenContract.balanceOf(sender)).toBe(900); // Assuming sender had 1000 tokens initially
//       expect(tokenContract.balanceOf(receiver)).toBe(100); // Assuming receiver had 0 tokens initially
//     });

//     it('should throw an error when sender has insufficient balance', () => {
//       // Arrange
//       const sender = 'sender_account';
//       const receiver = 'receiver_account';
//       const amount = 1000; // Trying to transfer more tokens than the sender has

//       // Act & Assert
//       expect(() => tokenContract.transfer(sender, receiver, amount)).toThrowError('Insufficient balance');
//     });
//   });

//   describe('balanceOf', () => {
//     it('should return the correct balance of an account', () => {
//       // Arrange
//       const account = 'account_1';
//       const initialBalance = 1000;

//       // Act
//       const balance = tokenContract.balanceOf(account);

//       // Assert
//       expect(balance).toBe(initialBalance); // Assuming the initial balance of the account is 1000
//     });

//     it('should return 0 for an account with no tokens', () => {
//       // Arrange
//       const account = 'account_2';

//       // Act
//       const balance = tokenContract.balanceOf(account);

//       // Assert
//       expect(balance).toBe(0); // Assuming the account has no tokens initially
//     });
//   });
// });