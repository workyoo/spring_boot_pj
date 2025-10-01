import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import MainPage from '../main/MainPage'
import Goods from '../board/Goods'
import Cars from '../board/Cars'
import Real_estate from '../board/Real_estate'
import Auction from '../board/Auction'
import LoginMain from '../login/LoginMain';
import LoginForm from '../login/LoginForm'
import SignupForm from '../login/SignupForm'
import Post from '../board/Post'
import AuctionMain from '../auction/auction_main/AuctionMain'
import AuctionDetail from '../auction/auction_main/AuctionDetail'
import Chat from '../chat/ChatMain'
import Map from '../chat/KakaoMap'
import GoodsDetail from '../board/GoodsDetail'
import AuthCallback from '../login/AuthCallback'
import UpdatePost from '../board/UpdatePost'
import MyPage from '../mypage'
import AdminPage from '../pages/AdminPage'
import SearchBox from '../board/SearchBox'
import TermsOfService from '../pages/TermsOfService'
import PrivacyPolicy from '../pages/PrivacyPolicy'
import Contact from '../pages/Contact'

const RouterMain = ({ handleLoginSuccess }) => {
  return (
    <div>
      <Routes>
        <Route element={<MainLayout />} >
          <Route path='/' element={<MainPage />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/cars' element={<Cars />} />
          <Route path='/goods' element={<Goods />} />
          <Route path='/real-estate' element={<Real_estate />} />
          <Route path='/auction' element={<AuctionMain />} />
          <Route path='/auction/detail/:postId' element={<AuctionDetail />} />
          <Route path='/signup' element={<SignupForm />} />
          <Route path='/board/post' element={<Post />} />
          {/* props로 받은 함수를 그대로 전달 */}
          <Route path='/login' element={<LoginMain onLoginSuccess={handleLoginSuccess} />} />
          <Route path='/auth/callback' element={<AuthCallback />} />
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/admin' element={<AdminPage />} />
          <Route path='/board/GoodsDetail' element={<GoodsDetail />} />
          <Route path='/map' element={<Map />} />
          <Route path='/board/update' element={<UpdatePost />} />
          <Route path='/board/search' element={<SearchBox />} />
          <Route path='/terms' element={<TermsOfService />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/contact' element={<Contact />} />
        </Route>
      </Routes>
    </div>
  );
};

export default RouterMain;