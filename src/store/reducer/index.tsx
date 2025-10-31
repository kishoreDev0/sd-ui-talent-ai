import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authentication/login';
import forgotPasswordReducer from '../slices/authentication/forgotPassword';
import changePasswordReducer from '../slices/authentication/changepassword';
import resetPasswordReducer from '../slices/authentication/resetPassword';
import inviteUserReducer from '../slices/authentication/inviteUser';
import registerReducer from '../slices/authentication/registerForm';
import jobReducer from '../job/slices/jobSlice';
import roleReducer from '../role/slices/roleSlice';
import permissionReducer from '../permission/slices/permissionSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  forgotPassword: forgotPasswordReducer,
  changePassword: changePasswordReducer,
  resetPassword: resetPasswordReducer,
  inviteUser: inviteUserReducer,
  register: registerReducer,
  job: jobReducer,
  role: roleReducer,
  permission: permissionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
