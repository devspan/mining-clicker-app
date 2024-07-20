import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CoinApp from './components/CoinApp';
import { ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import './css/customStyle.css';

const theme = createTheme();
const telApp = window.Telegram?.WebApp;
const isPhone = window.innerWidth < 600;

function App() {
  const [userData, setUserData] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [pointCount, setPointCount] = useState(0);
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(true);
  const [miningInfo, setMiningInfo] = useState({
    status: 'idle',
    perClick: 2,
    limit: 2000,
    max: 2000,
  });

  useEffect(() => {
    if (telApp) telApp.ready();
    init();
  }, []);

  useEffect(() => {
    if (userData?.id) {
      getUserProfile();
      handleSignUp();
      handleMiningInfo();
    }
  }, [userData]);

  const init = () => {
    try {
      const search = window.Telegram?.WebApp.initData;
      let data = null;
      if (search) {
        const converted = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', (key, value) => key === "" ? value : decodeURIComponent(value));
        data = JSON.parse(converted.user);
      } else {
        data = {
          "id": 2023448791,
          "first_name": "Tholana",
          "last_name": "Tyson",
          "username": "tholanamike",
          "language_code": "en",
          "is_premium": false,
          "allows_write_to_pm": true
        };
      }
      setUserData(data);
      setIsTelegramMiniApp(!!data);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsTelegramMiniApp(false);
    }
  };

  const getUserProfile = async () => {
    try {
      const getFileId = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/getUserProfilePhotos?user_id=${userData.id}`);
      const fileId = getFileId.data.result.photos[0][2].file_id;
      const getFilePath = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/getFile?file_id=${fileId}`);
      const filePath = getFilePath.data.result.file_path;
      setProfileUrl(`${process.env.REACT_APP_API_BASE_URL}/file/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/${filePath}`);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  
  const handleMiningInfo = async () => {
    if (!userData?.id) return;
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userData.id}`);
      if (response.data?.points) setPointCount(response.data.points);
      if (response.data?.limit) {
        setMiningInfo(prevMiningInfo => ({ ...prevMiningInfo, limit: response.data.limit }));
      }
    } catch (error) {
      console.error('Mining info error:', error);
    }
  };

  const handleSignUp = async () => {
    if (!userData?.id) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/signup`, {
        userId: userData.id,
        username: userData.username,
        firstname: userData.first_name,
        lastname: userData.last_name || 'null',
      });
      console.log('Signup was successful');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="App">
      {isPhone && isTelegramMiniApp ? (
        <ThemeProvider theme={theme}>
          <CoinApp
            userData={userData}
            profileUrl={profileUrl}
            telApp={telApp}
            userId={userData?.id}
            pointCount={pointCount}
            setPointCount={setPointCount}
            miningInfo={miningInfo}
            setMiningInfo={setMiningInfo}
          />
        </ThemeProvider>
      ) : (
        <div style={{height:'110vh'}}>
          <h3 style={{textAlign: 'center', background: 'rgb(216 215 215 / 42%)', display: 'inline-flex', padding: '20px', marginTop: '40vh', borderRadius: '20px'}}>
            You need to open this with the telegram bot!
          </h3>
          <h3>
            <a href='https://t.me/BambooBrawlerBot' style={{textDecoration:'none', color:'darkmagenta'}}>
              <img style={{verticalAlign:'middle', marginBottom:'16px'}} width="70" height="70" src="https://img.icons8.com/3d-fluency/94/robot-1.png" alt="robot-1"/> 
              <span> Go to BambooBrawlerBot </span>
            </a>
          </h3>
        </div>
      )}
    </div>
  );
}

export default App;