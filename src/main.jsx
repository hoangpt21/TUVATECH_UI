import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { store } from './redux/store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { injectStore } from "./utils/authorizeAxios.js"
import App from './App.jsx'
const persistor = persistStore(store)
injectStore(store)
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter basename='/'>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  // </StrictMode>,
)
