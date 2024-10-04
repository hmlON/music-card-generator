import React, { useRef, useState, useEffect } from 'react';
import './App.css'; // Ensure you have this import if you are using App.css

const SingleCardGenerator = () => {
  const canvasRef = useRef(null);
  const [mainImageSrc, setMainImageSrc] = useState(null);
  const [footerImageSrc, setFooterImageSrc] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [textColor, setTextColor] = useState('#ffffff'); // New state for text color

  // Function to darken a color
  const darkenColor = (color, amount) => {
    let usePound = false;
    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }
    const num = parseInt(color, 16);
    let r = (num >> 16) - amount;
    let g = ((num >> 8) & 0x00FF) - amount;
    let b = (num & 0x0000FF) - amount;
    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;
    return (usePound ? "#" : "") + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  };

  // Standard card size with 3mm bleed
  const CARD_WIDTH = 744; // Card width with bleed
  const CARD_HEIGHT = 1040; // Card height with bleed
  const BLEED = 35; // 3mm bleed in pixels
  const PADDING = 50; // Padding for image

  // Function to draw the single card
  const drawCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Fill background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Draw main image (if uploaded)
    if (mainImageSrc) {
      const backgroundImg = new Image();
      backgroundImg.src = mainImageSrc;
      backgroundImg.onload = () => {
        ctx.filter = 'blur(20px)';
        ctx.drawImage(
            backgroundImg,
            (CARD_WIDTH - CARD_HEIGHT) / 2,
            0,
            CARD_HEIGHT,
            CARD_HEIGHT
        );
        ctx.filter = 'none';

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, BLEED, CARD_HEIGHT);
        ctx.fillRect(CARD_WIDTH - BLEED, 0, BLEED, CARD_HEIGHT);
        ctx.fillRect(0, 0, CARD_WIDTH, BLEED);
        ctx.fillRect(0, CARD_HEIGHT - BLEED, CARD_WIDTH, BLEED);

        const mainImg = new Image();
        mainImg.src = mainImageSrc;
        mainImg.onload = () => {
          // Draw the main image within the card
          ctx.drawImage(
              mainImg,
              BLEED + PADDING,
              BLEED + PADDING,
              CARD_WIDTH - 2 * (BLEED + PADDING),
              CARD_WIDTH - 2 * (BLEED + PADDING)
          );

          // Draw album name
          ctx.font = '50px Nunito';
          ctx.fillStyle = darkenColor(textColor, 50); // Darken text color
          ctx.textAlign = 'left';
          ctx.fillText(albumName, BLEED + PADDING * 2, BLEED + PADDING + CARD_WIDTH - 2 * (BLEED + PADDING) + 70);

          // Draw artist name
          ctx.font = '35px Nunito';
          ctx.fillStyle = darkenColor(textColor, 100); // Darken text color
          ctx.textAlign = 'left';
          ctx.fillText(artistName, BLEED + PADDING * 2, BLEED + PADDING + CARD_WIDTH - 2 * (BLEED + PADDING) + 120);
        };
      };
    }

    // Draw footer image (if uploaded)
    if (footerImageSrc) {
      const footerImg = new Image();
      footerImg.src = footerImageSrc;
      footerImg.onload = () => {
        const aspectRatio = footerImg.width / footerImg.height;
        const footerHeight = (CARD_WIDTH - 2 * BLEED) / aspectRatio; // Calculate height based on aspect ratio
        ctx.globalCompositeOperation = 'lighten';
        ctx.drawImage(
            footerImg,
            BLEED,
            CARD_HEIGHT - BLEED - footerHeight,
            CARD_WIDTH - 2 * BLEED,
            footerHeight
        );
        ctx.globalCompositeOperation = 'source-over';
      };
    }
  };

  // Effect to redraw the card whenever state changes
  useEffect(() => {
    drawCard();
  }, [mainImageSrc, footerImageSrc, bgColor, artistName, albumName, textColor]);

  // Handle image upload for the main image
  const handleMainImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setMainImageSrc(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload for the footer image
  const handleFooterImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setFooterImageSrc(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle download of the single card
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'custom-card.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
      <div style={{ textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
        <h1>Single Playing Card Generator</h1>

        {/* Main Image Upload */}
        <div>
          <label htmlFor="mainImageUpload">Upload Main Image:</label>
          <input
              type="file"
              id="mainImageUpload"
              accept="image/*"
              onChange={handleMainImageUpload}
          />
        </div>

        {/* Footer Image Upload */}
        <div>
          <label htmlFor="footerImageUpload">Upload Footer Image:</label>
          <input
              type="file"
              id="footerImageUpload"
              accept="image/*"
              onChange={handleFooterImageUpload}
          />
        </div>

        {/* Artist Name Input */}
        <div>
          <label htmlFor="artistName">Artist Name:</label>
          <input
              type="text"
              id="artistName"
              placeholder="Enter artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
          />
        </div>

        {/* Album Name Input */}
        <div>
          <label htmlFor="albumName">Album Name:</label>
          <input
              type="text"
              id="albumName"
              placeholder="Enter album name"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
          />
        </div>

        {/* Text Color */}
        <div>
          <label htmlFor="textColor">Text Color:</label>
          <input
              type="color"
              id="textColor"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
          />
        </div>

        {/* Background Color */}
        <div>
          <label htmlFor="bgColor">Background Color:</label>
          <input
              type="color"
              id="bgColor"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        {/* Canvas */}
        <div>
          <canvas
              ref={canvasRef}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              style={{ border: '1px solid black', marginTop: '20px' }}
          ></canvas>
        </div>

        {/* Download Button */}
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleDownload}>Download Card</button>
        </div>
      </div>
  );
};

export default SingleCardGenerator;