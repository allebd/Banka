import userController from '../controllers/user.controller';
import accountController from '../controllers/account.controller';
import authenticate from '../middleware/authenticate';

const API_VERSION = '/api/v1';

const route = (app) => {
  app.post(`${API_VERSION}/auth/signup`, userController.signup);
  app.post(`${API_VERSION}/auth/signin`, userController.signin);
  app.post(`${API_VERSION}/accounts`, authenticate, accountController.createAccount);
  app.patch(`${API_VERSION}/accounts/:accountNumber`, authenticate, accountController.changeAccountStatus);
  app.delete(`${API_VERSION}/accounts/:accountNumber`, authenticate, accountController.deleteAccount);
};

export default route;
