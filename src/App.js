import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CoinApp from './components/CoinApp';
import { ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import './css/customStyle.css';

const theme = createTheme();
const tg = window.Telegram?.WebApp;

console.log('Full Telegram WebApp object:', tg);

// Eruda initialization button component
const ErudaButton = () => {
  const initEruda = () => {
    if (window.eruda) {
      window.eruda.init();
      console.log('Eruda initialized');
    } else {
      console.error('Eruda not found');
    }
  };

  return (
    <button 
      onClick={initEruda}
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        padding: '10px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px'
      }}
    >
      Debug
    </button>
  );
};

function App() {
  console.log('App component rendering');

  const [userData, setUserData] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [pointCount, setPointCount] = useState(0);
  const [miningInfo, setMiningInfo] = useState({
    status: 'idle',
    perClick: 2,
    limit: 2000,
    max: 2000,
  });

  useEffect(() => {
    console.log('Initial useEffect running');
    if (tg) {
      console.log('Telegram WebApp found, calling tg.ready()');
      tg.ready();
      init();
    } else {
      console.warn('Telegram WebApp not found');
    }
  }, []);

  useEffect(() => {
    console.log('userData useEffect running, userData:', userData);
    if (userData?.id) {
      getUserProfile();
      handleSignUp();
      handleMiningInfo();
    }
  }, [userData]);

  const init = () => {
    console.log('Initializing app');
    try {
      const initDataUnsafe = tg.initDataUnsafe;
      console.log('Init data unsafe:', initDataUnsafe);
      if (initDataUnsafe && initDataUnsafe.user && initDataUnsafe.user.id) {
        console.log('Setting user data:', initDataUnsafe.user);
        setUserData(initDataUnsafe.user);
      } else {
        console.warn('No valid user data in Telegram WebApp');
        // Set a default user object
        setUserData({ id: 'unknown', first_name: 'Guest', username: 'guest' });
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      // Set a default user object in case of error
      setUserData({ id: 'error', first_name: 'Error', username: 'error' });
    }
  };

  const getUserProfile = async () => {
    console.log('Getting user profile');
    if (!userData?.id || userData.id === 'unknown' || userData.id === 'error') {
      console.warn('No valid user ID available for fetching profile');
      return;
    }
    try {
      console.log('Fetching file ID');
      const getFileId = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/getUserProfilePhotos?user_id=${userData.id}`);
      console.log('File ID response:', getFileId.data);
      if (getFileId.data.result.photos && getFileId.data.result.photos.length > 0) {
        const fileId = getFileId.data.result.photos[0][2].file_id;
        console.log('Fetching file path');
        const getFilePath = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/getFile?file_id=${fileId}`);
        console.log('File path response:', getFilePath.data);
        const filePath = getFilePath.data.result.file_path;
        const url = `${process.env.REACT_APP_API_BASE_URL}/file/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/${filePath}`;
        console.log('Setting profile URL:', url);
        setProfileUrl(url);
      } else {
        console.warn('No profile photo available');
        setProfileUrl(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileUrl(null);
    }
  };
  
  const handleMiningInfo = async () => {
    console.log('Handling mining info');
    if (!userData?.id || userData.id === 'unknown' || userData.id === 'error') {
      console.warn('No valid user ID available for fetching mining info');
      return;
    }
    try {
      console.log('Fetching user data');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/${userData.id}`);
      console.log('User data response:', response.data);
      if (response.data?.points) {
        console.log('Setting point count:', response.data.points);
        setPointCount(response.data.points);
      }
      if (response.data?.limit) {
        console.log('Updating mining info limit:', response.data.limit);
        setMiningInfo(prevMiningInfo => ({ ...prevMiningInfo, limit: response.data.limit }));
      }
    } catch (error) {
      console.error('Mining info error:', error);
    }
  };

  const handleSignUp = async () => {
    console.log('Handling sign up');
    if (!userData?.id || userData.id === 'unknown' || userData.id === 'error') {
      console.warn('No valid user ID available for signup');
      return;
    }
    try {
      console.log('Sending signup request');
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/signup`, {
        userId: userData.id,
        username: userData.username || 'unknown',
        firstname: userData.first_name || 'Unknown',
        lastname: userData.last_name || 'Unknown',
      });
      console.log('Signup response:', response.data);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  console.log('Rendering App component');
  return (
    <div className="App">
      {tg ? (
        <ThemeProvider theme={theme}>
          <CoinApp
            userData={userData}
            profileUrl={profileUrl}
            tg={tg}
            userId={userData?.id}
            pointCount={pointCount}
            setPointCount={setPointCount}
            miningInfo={miningInfo}
            setMiningInfo={setMiningInfo}
          />
          <ErudaButton />
        </ThemeProvider>
      ) : (
        <div style={{height:'110vh'}}>
          <h3 style={{textAlign: 'center', background: 'rgb(216 215 215 / 42%)', display: 'inline-flex', padding: '20px', marginTop: '40vh', borderRadius: '20px'}}>
            You need to open this with the Telegram bot!
          </h3>
          <h3>
            <a href='https://t.me/BambooBrawlerBot' style={{textDecoration:'none', color:'darkmagenta'}}>
              <img style={{verticalAlign:'middle', marginBottom:'16px'}} width="70" height="70" src="https://img.icons8.com/3d-fluency/94/robot-1.png" alt="robot-1"/> 
              <span> Go to BambooBrawlerBot </span>
            </a>
          </h3>
          <ErudaButton />
        </div>
      )}
    </div>
  );
}

export default App;