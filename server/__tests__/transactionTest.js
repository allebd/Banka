import chaiHttp from 'chai-http';
import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';
import app from '../server';

const { SECRET } = process.env;

chai.use(chaiHttp);

const API_VERSION = '/api/v1';
const testUser = {
  id: 90,
  firstName: 'steve',
  lastName: 'cannon',
  email: 'testing@transaction.com',
  password: 'delapassword',
  confirmPassword: 'delapassword',
};

const jwtUser = {
  id: 90,
  email: 'testing@transaction.com',
  type: 'client',
  isAdmin: false,
};

const transactionUser = {
  amount: 555555,
};
const accountNumber = 2039939293;
const userToken = jwt.sign(jwtUser, SECRET, { expiresIn: '24h' });

describe('Testing Transaction Controller', () => {
  /**
     * Sign in user to generate user token before test
     */
  before('transaction operations can begin when user have signed up', (done) => {
    chai.request(app)
      .post(`${API_VERSION}/auth/signup`)
      .send(testUser)
      .end((error, response) => {
        expect(response.body.status).to.equal(201);
        done();
      });
  });

  describe('Testing credit account controller', () => {
    /**
       * Test the POST /transactions/<account-number>/credit endpoint
       */
    const transactionUrl = `${API_VERSION}/transactions/${accountNumber}/credit`;

    it('should not create account when authorization is undefined', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .send({})
        .end((error, response) => {
          // eslint-disable-next-line no-unused-expressions
          expect(response.headers.authorization).to.be.undefined;
          done();
        });
    });

    it('should not credit account when authorization token is invalid', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', '555555')
        .send(transactionUser)
        .end((error, response) => {
          expect(response).to.have.status(401);
          expect(response.body.status).to.equal(401);
          expect(response.body.error).to.equal('Invalid token!');
          done();
        });
    });

    it('should credit account when all the parameters are given', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send(transactionUser)
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response).to.have.status(200);
          expect(response.body.status).to.equal(200);
          expect(response.body.data).to.be.a('array');
          expect(response.body.data[0]).to.have.property('transactionId');
          expect(response.body.data[0]).to.have.property('accountNumber');
          expect(response.body.data[0]).to.have.property('amount');
          expect(response.body.data[0]).to.have.property('cashier');
          expect(response.body.data[0]).to.have.property('transactionType');
          expect(response.body.data[0]).to.have.property('accountBalance');
          done();
        });
    });

    it('should not credit account when the amount is zero', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send({
          amount: 0,
        })
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('Amount is too low');
          done();
        });
    });

    it('should not credit account when the amount is less than zero', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send({
          amount: -20,
        })
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('Amount is too low');
          done();
        });
    });

    it('should not credit account when the account number is not a number', (done) => {
      chai.request(app)
        .post(`${API_VERSION}/transactions/xxyyzz/credit`)
        .send(transactionUser)
        .set('Authorization', userToken)
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('A number is expected');
          done();
        });
    });
  });

  describe('Testing debit account controller', () => {
    /**
       * Test the POST /transactions/<account-number>/debit endpoint
       */
    const transactionUrl = `${API_VERSION}/transactions/${accountNumber}/debit`;

    it('should not create account when authorization is undefined', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .send({})
        .end((error, response) => {
          // eslint-disable-next-line no-unused-expressions
          expect(response.headers.authorization).to.be.undefined;
          done();
        });
    });

    it('should not debit account when authorization token is invalid', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', '555555')
        .send(transactionUser)
        .end((error, response) => {
          expect(response).to.have.status(401);
          expect(response.body.status).to.equal(401);
          expect(response.body.error).to.equal('Invalid token!');
          done();
        });
    });

    it('should debit account when all the parameters are given', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send(transactionUser)
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response).to.have.status(200);
          expect(response.body.status).to.equal(200);
          expect(response.body.data).to.be.a('array');
          expect(response.body.data[0]).to.have.property('transactionId');
          expect(response.body.data[0]).to.have.property('accountNumber');
          expect(response.body.data[0]).to.have.property('amount');
          expect(response.body.data[0]).to.have.property('cashier');
          expect(response.body.data[0]).to.have.property('transactionType');
          expect(response.body.data[0]).to.have.property('accountBalance');
          done();
        });
    });

    it('should not debit account when the amount is zero', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send({
          amount: 0,
        })
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('Amount is too low');
          done();
        });
    });

    it('should not debit account when the amount is null', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send({
          amount: null,
        })
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('No amount entered');
          done();
        });
    });

    it('should not debit account when the amount is less than zero', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send({
          amount: -20,
        })
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('Amount is too low');
          done();
        });
    });

    it('should not debit account when the amount is greater than the balance', (done) => {
      chai.request(app)
        .post(transactionUrl)
        .set('Authorization', userToken)
        .send({
          amount: 30000000,
        })
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('Insufficients Funds');
          done();
        });
    });

    it('should not debit account when the account number is not a number', (done) => {
      chai.request(app)
        .post(`${API_VERSION}/transactions/xxyyzz/debit`)
        .send(transactionUser)
        .set('Authorization', userToken)
        .end((error, response) => {
          expect(response.body).to.be.an('object');
          expect(response.body.status).to.equal(400);
          expect(response.body.error).to.be.a('string');
          expect(response.body.error).to.equal('A number is expected');
          done();
        });
    });
  });
});
