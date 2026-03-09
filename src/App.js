import React, { useRef, useState, useEffect, useCallback } from 'react';
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
    return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  // Standard card size with 3mm bleed
  const CARD_WIDTH = 744; // Card width with bleed
  const CARD_HEIGHT = 1040; // Card height with bleed
  const BLEED = 35; // 3mm bleed in pixels
  const PADDING = 50; // Padding for image

  // Function to draw the single card
  const drawCard = useCallback(() => {
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

          const splitTextIntoLines = (ctx, text, maxWidth) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
              const word = words[i];
              const width = ctx.measureText(currentLine + ' ' + word).width;
              if (width < maxWidth) {
                currentLine += ' ' + word;
              } else {
                lines.push(currentLine);
                currentLine = word;
              }
            }
            lines.push(currentLine);
            return lines;
          };

          // Draw album name
          ctx.font = '50px Nunito';
          ctx.fillStyle = darkenColor(textColor, 50); // Darken text color
          ctx.textAlign = 'left';
          const maxWidth = CARD_WIDTH - 2 * (BLEED + PADDING * 2);
          const lines = splitTextIntoLines(ctx, albumName, maxWidth);
          lines.forEach((line, index) => {
            ctx.fillText(line, BLEED + PADDING * 2, BLEED + PADDING + CARD_WIDTH - 2 * (BLEED + PADDING) + 70 + index * 60);
          });

          // Draw artist name
          ctx.font = '35px Nunito';
          ctx.fillStyle = darkenColor(textColor, 100); // Darken text color
          ctx.textAlign = 'left';
          ctx.fillText(artistName, BLEED + PADDING * 2, BLEED + PADDING + CARD_WIDTH - 2 * (BLEED + PADDING) + 60 + lines.length * 60);
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
  }, [mainImageSrc, footerImageSrc, bgColor, artistName, albumName, textColor]);

  // Effect to redraw the card whenever state changes
  useEffect(() => {
    drawCard();
  }, [drawCard]);

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

const A4PageGenerator = () => {
  const canvasRef = useRef(null);
  const [pageSize, setPageSize] = useState('a4'); // 'a4' or '10x15'
  const [cardSize, setCardSize] = useState('playing'); // 'playing' or 'business'
  const [cardImages, setCardImages] = useState(Array(9).fill(null));
  const [useSingleImage, setUseSingleImage] = useState(false); // Toggle for single image mode
  const [singleImage, setSingleImage] = useState(null); // Single image to repeat

  // Card dimensions based on selected card size (at 300 DPI with 3mm bleed)
  const cardSizes = {
    playing: {
      width: 744, // Playing card: 63mm (2.48") width with bleed
      height: 1040, // Playing card: 88mm (3.46") height with bleed
      name: 'Playing Card'
    },
    business: {
      width: 590, // Wallet card: 50mm width with bleed (maintaining 63:88 ratio)
      height: 825, // Wallet card: 70mm height with bleed (maintaining 63:88 ratio, fits in wallet)
      name: 'Business Card'
    }
  };

  const currentCardSize = cardSizes[cardSize];
  const CARD_WIDTH = currentCardSize.width;
  const CARD_HEIGHT = currentCardSize.height;

  // Calculate how many cards fit based on page and card size
  const calculateCardsPerPage = (pageWidth, pageHeight, cardWidth, cardHeight) => {
    // Try portrait orientation
    const portraitCardsPerRow = Math.floor(pageWidth / cardWidth);
    const portraitCardsPerColumn = Math.floor(pageHeight / cardHeight);
    const portraitTotal = portraitCardsPerRow * portraitCardsPerColumn;

    // Try landscape orientation (rotated 90 degrees)
    const landscapeCardsPerRow = Math.floor(pageWidth / cardHeight);
    const landscapeCardsPerColumn = Math.floor(pageHeight / cardWidth);
    const landscapeTotal = landscapeCardsPerRow * landscapeCardsPerColumn;

    // Choose the orientation that fits more cards
    if (landscapeTotal > portraitTotal) {
      return {
        cardsPerRow: landscapeCardsPerRow,
        totalCards: landscapeTotal,
        rotated: true
      };
    } else {
      return {
        cardsPerRow: portraitCardsPerRow,
        totalCards: portraitTotal,
        rotated: false
      };
    }
  };

  // Page dimensions based on selected size
  const pageSizes = {
    a4: {
      width: 2480, // A4 width in pixels at 300 DPI
      height: 3508, // A4 height in pixels at 300 DPI
      ...calculateCardsPerPage(2480, 3508, CARD_WIDTH, CARD_HEIGHT)
    },
    '10x15': {
      width: 1772, // 10x15cm width in pixels at 300 DPI
      height: 1181, // 10x15cm height in pixels at 300 DPI
      ...calculateCardsPerPage(1772, 1181, CARD_WIDTH, CARD_HEIGHT)
    }
  };

  const currentPageSize = pageSizes[pageSize];
  const PAGE_WIDTH = currentPageSize.width;
  const PAGE_HEIGHT = currentPageSize.height;

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    const newPageSize = newSize === 'a4'
      ? { width: 2480, height: 3508 }
      : { width: 1772, height: 1181 };
    const cardLayout = calculateCardsPerPage(newPageSize.width, newPageSize.height, CARD_WIDTH, CARD_HEIGHT);
    setCardImages(Array(cardLayout.totalCards).fill(null));
  };

  const handleCardSizeChange = (newSize) => {
    setCardSize(newSize);
    const newCardDimensions = cardSizes[newSize];
    const currentPageDimensions = pageSize === 'a4'
      ? { width: 2480, height: 3508 }
      : { width: 1772, height: 1181 };
    const cardLayout = calculateCardsPerPage(
      currentPageDimensions.width,
      currentPageDimensions.height,
      newCardDimensions.width,
      newCardDimensions.height
    );
    setCardImages(Array(cardLayout.totalCards).fill(null));
  };

  const handleCardUpload = (index, event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const newCardImages = [...cardImages];
      newCardImages[index] = e.target.result;
      setCardImages(newCardImages);
    };
    reader.readAsDataURL(file);
  };

  const handleSingleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setSingleImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const drawA4Page = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    // Fill the canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    // Determine which images to use
    const imagesToDraw = useSingleImage
      ? Array(currentPageSize.totalCards).fill(singleImage)
      : cardImages;

    // Draw each card image based on current page size
    imagesToDraw.forEach((imageSrc, index) => {
      if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          if (currentPageSize.rotated) {
            // Draw rotated cards (landscape orientation)
            const x = (index % currentPageSize.cardsPerRow) * CARD_HEIGHT;
            const y = Math.floor(index / currentPageSize.cardsPerRow) * CARD_WIDTH;

            ctx.save();
            // Move to the position and rotate
            ctx.translate(x + CARD_HEIGHT, y);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
            ctx.restore();
          } else {
            // Draw normal cards (portrait orientation)
            const x = (index % currentPageSize.cardsPerRow) * CARD_WIDTH;
            const y = Math.floor(index / currentPageSize.cardsPerRow) * CARD_HEIGHT;
            ctx.drawImage(img, x, y, CARD_WIDTH, CARD_HEIGHT);
          }
        };
      }
    });
  }, [cardImages, singleImage, useSingleImage, PAGE_WIDTH, PAGE_HEIGHT, currentPageSize.cardsPerRow, currentPageSize.rotated, currentPageSize.totalCards, CARD_WIDTH, CARD_HEIGHT]);

  useEffect(() => {
    drawA4Page();
  }, [drawA4Page]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${pageSize}-page.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
      <div style={{ textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
        <h1>Page Generator</h1>

        {/* Page Size Selector */}
        <div style={{marginBottom: '20px'}}>
          <label htmlFor="pageSize">Select Page Size: </label>
          <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              style={{padding: '5px', fontSize: '16px', marginRight: '20px'}}
          >
            <option value="a4">A4</option>
            <option value="10x15">10x15cm</option>
          </select>

          <label htmlFor="cardSize">Select Card Size: </label>
          <select
              id="cardSize"
              value={cardSize}
              onChange={(e) => handleCardSizeChange(e.target.value)}
              style={{padding: '5px', fontSize: '16px'}}
          >
            <option value="playing">Playing Card (63x88mm)</option>
            <option value="business">Wallet Card (50x70mm - same ratio as playing card)</option>
          </select>

          <div style={{marginTop: '10px', fontSize: '14px', color: '#666'}}>
            {currentPageSize.totalCards} card{currentPageSize.totalCards !== 1 ? 's' : ''} will fit on this page
            {currentPageSize.rotated && ' (rotated 90°)'}
          </div>
        </div>

        {/* Single Image Mode Toggle */}
        <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
          <label>
            <input
                type="checkbox"
                checked={useSingleImage}
                onChange={(e) => setUseSingleImage(e.target.checked)}
                style={{marginRight: '10px'}}
            />
            Use single image and repeat it across all cards
          </label>

          {useSingleImage && (
            <div style={{marginTop: '10px'}}>
              <label htmlFor="singleImageUpload">Upload Image to Repeat:</label>
              <input
                  type="file"
                  id="singleImageUpload"
                  accept="image/*"
                  onChange={handleSingleImageUpload}
                  style={{marginLeft: '10px'}}
              />
            </div>
          )}
        </div>

        {/* Card Uploads */}
        {!useSingleImage && (
          <div>
            {cardImages.map((_, index) => (
                <div key={index}>
                  <label htmlFor={`cardUpload${index}`}>Upload Card {index + 1}:</label>
                  <input
                      type="file"
                      id={`cardUpload${index}`}
                      accept="image/*"
                      onChange={(e) => handleCardUpload(index, e)}
                  />
                </div>
            ))}
          </div>
        )}

        {/* Canvas Wrapper */}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {/* Canvas Wrapper */}
          <div style={{overflow: 'auto', maxWidth: '80%', border: '1px solid black'}}>
            <canvas
                ref={canvasRef}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                style={{border: '0px solid black', width: '100%', height: 'auto'}}
            ></canvas>
          </div>
        </div>

        {/* Download Button */}
        <div style={{marginTop: '10px'}}>
          <button onClick={handleDownload}>Download {pageSize === 'a4' ? 'A4' : '10x15cm'} Page</button>
        </div>
      </div>
  );
};

const App = () => {
  return (
      <div>
        <SingleCardGenerator/>
        <A4PageGenerator/>
      </div>
  );
};

export default App;
