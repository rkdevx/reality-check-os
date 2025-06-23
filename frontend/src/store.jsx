import {configureStore } from '@reduxjs/toolkit';
import LoginSliceReducer from './redux/Login/loginSlice.jsx';



 const store = configureStore ({
  reducer: {
    login : LoginSliceReducer
    },
});

export default store;