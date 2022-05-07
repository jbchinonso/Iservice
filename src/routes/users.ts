import express from 'express';
const router = express.Router();

import UserController from '../controllers/userController'
import PasswordController from '../controllers/PasswordController'
import contactController from '../controllers/contactController'
import Auth from '../middlewares/auth'

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/api/v1/signup', UserController.signUp)
router.get('/verify-email', UserController.verifyAccount)
router.post('/api/v1/login', UserController.login)
router.post('/api/v1/create/pin', Auth.verifyToken, UserController.setTransactionPin)
router.get('/api/v1/profile', Auth.verifyToken, UserController.getProfile)
router.post('/api/v1/profile/update', Auth.verifyToken, UserController.updateProfile)
router.post('/api/v1/bank/add', Auth.verifyToken, UserController.addBankAccount)
router.post('/api/v1/password/request-reset', PasswordController.requestPasswordReset)
router.get('/api/v1/password/comfirm-reset', PasswordController.comfirmPasswordResetRequest)
router.post('/api/v1/password/resetpassword', PasswordController.resetPassword)
router.post('/api/v1/contactus', contactController.contactUsByMail)

export default router;
