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

  // Standard card size without bleed
  const CARD_WIDTH = 674; // Card width without bleed (63mm at 300 DPI)
  const CARD_HEIGHT = 970; // Card height without bleed (88mm - 2*3mm at 300 DPI)
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

        const mainImg = new Image();
        mainImg.src = mainImageSrc;
        mainImg.onload = () => {
          // Draw the main image within the card
          ctx.drawImage(
              mainImg,
              PADDING,
              PADDING,
              CARD_WIDTH - 2 * PADDING,
              CARD_WIDTH - 2 * PADDING
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
          const maxWidth = CARD_WIDTH - 2 * (PADDING * 2);
          const lines = splitTextIntoLines(ctx, albumName, maxWidth);
          lines.forEach((line, index) => {
            ctx.fillText(line, PADDING * 2, PADDING + CARD_WIDTH - 2 * PADDING + 70 + index * 60);
          });

          // Draw artist name
          ctx.font = '35px Nunito';
          ctx.fillStyle = darkenColor(textColor, 100); // Darken text color
          ctx.textAlign = 'left';
          ctx.fillText(artistName, PADDING * 2, PADDING + CARD_WIDTH - 2 * PADDING + 60 + lines.length * 60);
        };
      };
    }

    // Draw footer image (if uploaded)
    if (footerImageSrc) {
      const footerImg = new Image();
      footerImg.src = footerImageSrc;
      footerImg.onload = () => {
        const aspectRatio = footerImg.width / footerImg.height;
        const footerHeight = CARD_WIDTH / aspectRatio; // Calculate height based on aspect ratio
        ctx.globalCompositeOperation = 'lighten';
        ctx.drawImage(
            footerImg,
            0,
            CARD_HEIGHT - footerHeight,
            CARD_WIDTH,
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
      <div style={{ fontFamily: 'Nunito, sans-serif', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>Single Playing Card Generator</h1>

        <div className="card-generator-container">
          {/* Left side - Options */}
          <div className="options-panel">
            {/* Main Image Upload */}
            <div>
              <label htmlFor="mainImageUpload" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload Main Image:</label>
              <input
                  type="file"
                  id="mainImageUpload"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  style={{ width: '100%' }}
              />
            </div>

            {/* Footer Image Upload */}
            <div>
              <label htmlFor="footerImageUpload" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Upload Footer Image:</label>
              <input
                  type="file"
                  id="footerImageUpload"
                  accept="image/*"
                  onChange={handleFooterImageUpload}
                  style={{ width: '100%' }}
              />
            </div>

            {/* Artist Name Input */}
            <div>
              <label htmlFor="artistName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Artist Name:</label>
              <input
                  type="text"
                  id="artistName"
                  placeholder="Enter artist name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Album Name Input */}
            <div>
              <label htmlFor="albumName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Album Name:</label>
              <input
                  type="text"
                  id="albumName"
                  placeholder="Enter album name"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Text Color */}
            <div>
              <label htmlFor="textColor" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Text Color:</label>
              <input
                  type="color"
                  id="textColor"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: '100%', height: '40px', cursor: 'pointer' }}
              />
            </div>

            {/* Background Color */}
            <div>
              <label htmlFor="bgColor" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Background Color:</label>
              <input
                  type="color"
                  id="bgColor"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: '100%', height: '40px', cursor: 'pointer' }}
              />
            </div>

            {/* Download Button */}
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleDownload} style={{ width: '100%', padding: '12px', fontSize: '16px', cursor: 'pointer' }}>Download Card</button>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="preview-panel">
            <canvas
                ref={canvasRef}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                style={{ border: '1px solid black', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
            ></canvas>
          </div>
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
  const [useEqualSpacing, setUseEqualSpacing] = useState(false); // Toggle for equal spacing mode

  // Card dimensions based on selected card size (at 300 DPI without bleed)
  const cardSizes = {
    playing: {
      width: 674, // Playing card: 63mm (2.48") width without bleed
      height: 970, // Playing card: 88mm (3.46") height without bleed
      name: 'Playing Card'
    },
    business: {
      width: 520, // Wallet card: 50mm width without bleed
      height: 755, // Wallet card: 70mm height without bleed (maintaining 63:88 ratio, fits in wallet)
      name: 'Business Card'
    }
  };

  const currentCardSize = cardSizes[cardSize];
  const CARD_WIDTH = currentCardSize.width;
  const CARD_HEIGHT = currentCardSize.height;

  // Calculate how many cards fit based on page and card size
  const calculateCardsPerPage = (pageWidth, pageHeight, cardWidth, cardHeight, equalSpacing = false) => {
    if (equalSpacing) {
      // For equal spacing mode, calculate based on card dimensions
      // Cards are positioned at edges with equal spacing between them

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
          cardsPerColumn: landscapeCardsPerColumn,
          totalCards: landscapeTotal,
          rotated: true,
          cardWidth,
          cardHeight
        };
      } else {
        return {
          cardsPerRow: portraitCardsPerRow,
          cardsPerColumn: portraitCardsPerColumn,
          totalCards: portraitTotal,
          rotated: false,
          cardWidth,
          cardHeight
        };
      }
    } else {
      // Original logic for non-equal spacing (cards can overlap slightly)
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
          cardsPerColumn: landscapeCardsPerColumn,
          totalCards: landscapeTotal,
          rotated: true
        };
      } else {
        return {
          cardsPerRow: portraitCardsPerRow,
          cardsPerColumn: portraitCardsPerColumn,
          totalCards: portraitTotal,
          rotated: false
        };
      }
    }
  };

  // Page dimensions based on selected size
  const pageSizes = {
    a4: {
      width: 2480, // A4 width in pixels at 300 DPI
      height: 3508, // A4 height in pixels at 300 DPI
      ...calculateCardsPerPage(2480, 3508, CARD_WIDTH, CARD_HEIGHT, useEqualSpacing)
    },
    '10x15': {
      width: 1772, // 10x15cm width in pixels at 300 DPI
      height: 1181, // 10x15cm height in pixels at 300 DPI
      ...calculateCardsPerPage(1772, 1181, CARD_WIDTH, CARD_HEIGHT, useEqualSpacing)
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
    const cardLayout = calculateCardsPerPage(newPageSize.width, newPageSize.height, CARD_WIDTH, CARD_HEIGHT, useEqualSpacing);
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
      newCardDimensions.height,
      useEqualSpacing
    );
    setCardImages(Array(cardLayout.totalCards).fill(null));
  };

  const handleEqualSpacingChange = (enabled) => {
    setUseEqualSpacing(enabled);
    const currentPageDimensions = pageSize === 'a4'
      ? { width: 2480, height: 3508 }
      : { width: 1772, height: 1181 };
    const cardLayout = calculateCardsPerPage(
      currentPageDimensions.width,
      currentPageDimensions.height,
      CARD_WIDTH,
      CARD_HEIGHT,
      enabled
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

    if (useEqualSpacing) {
      // Equal spacing mode: cards at edges with equal spacing between
      const cardWidth = currentPageSize.cardWidth;
      const cardHeight = currentPageSize.cardHeight;
      const cardsPerRow = currentPageSize.cardsPerRow;
      const cardsPerColumn = currentPageSize.cardsPerColumn;

      // Calculate spacing between cards
      // For equal spacing: first card at (0,0), last card at (pageWidth-cardWidth, pageHeight-cardHeight)
      // Space between cards = (totalSpace - allCardWidths) / (numCards - 1)
      const effectiveCardWidth = currentPageSize.rotated ? cardHeight : cardWidth;
      const effectiveCardHeight = currentPageSize.rotated ? cardWidth : cardHeight;

      // Calculate spacing to distribute cards from edge to edge
      let horizontalSpacing = 0;
      let verticalSpacing = 0;

      if (cardsPerRow > 1) {
        // Space available between cards
        horizontalSpacing = (PAGE_WIDTH - effectiveCardWidth * cardsPerRow) / (cardsPerRow - 1);
      }

      if (cardsPerColumn > 1) {
        // Space available between cards
        verticalSpacing = (PAGE_HEIGHT - effectiveCardHeight * cardsPerColumn) / (cardsPerColumn - 1);
      }

      // Draw each card image
      imagesToDraw.forEach((imageSrc, index) => {
        if (imageSrc) {
          const img = new Image();
          img.src = imageSrc;
          img.onload = () => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;

            if (currentPageSize.rotated) {
              // Rotated cards (landscape orientation)
              // Use consistent effective dimensions for positioning
              const x = col * (effectiveCardWidth + horizontalSpacing);
              const y = row * (effectiveCardHeight + verticalSpacing);

              ctx.save();
              ctx.translate(x + effectiveCardWidth, y);
              ctx.rotate(Math.PI / 2);

              // Draw the full source image scaled to fit the destination dimensions
              ctx.drawImage(
                img,
                0, 0, // Draw entire source image
                img.width, img.height, // Source size (full image)
                0, 0, // Destination position
                cardWidth, cardHeight // Destination size
              );
              ctx.restore();
            } else {
              // Portrait cards
              const x = col * (effectiveCardWidth + horizontalSpacing);
              const y = row * (effectiveCardHeight + verticalSpacing);

              // Draw the full source image scaled to fit the destination dimensions
              ctx.drawImage(
                img,
                0, 0, // Draw entire source image
                img.width, img.height, // Source size (full image)
                x, y, // Destination position
                cardWidth, cardHeight // Destination size
              );
            }
          };
        }
      });
    } else {
      // Original mode: cards with bleed overlapping
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
    }
  }, [cardImages, singleImage, useSingleImage, useEqualSpacing, PAGE_WIDTH, PAGE_HEIGHT, currentPageSize, CARD_WIDTH, CARD_HEIGHT]);

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
      <div style={{ fontFamily: 'Nunito, sans-serif', padding: '20px', marginTop: '40px', borderTop: '2px solid #ccc' }}>
        <h1 style={{ textAlign: 'center' }}>Page Generator</h1>

        <div className="card-generator-container">
          {/* Left side - Options */}
          <div className="options-panel">
            {/* Page Size Selector */}
            <div>
              <label htmlFor="pageSize" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Page Size:</label>
              <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  style={{width: '100%', padding: '8px', fontSize: '16px'}}
              >
                <option value="a4">A4</option>
                <option value="10x15">10x15cm</option>
              </select>
            </div>

            {/* Card Size Selector */}
            <div>
              <label htmlFor="cardSize" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Card Size:</label>
              <select
                  id="cardSize"
                  value={cardSize}
                  onChange={(e) => handleCardSizeChange(e.target.value)}
                  style={{width: '100%', padding: '8px', fontSize: '16px'}}
              >
                <option value="playing">Playing Card (63x88mm)</option>
                <option value="business">Wallet Card (50x70mm)</option>
              </select>
            </div>

            <div style={{padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '14px', color: '#666'}}>
              {currentPageSize.totalCards} card{currentPageSize.totalCards !== 1 ? 's' : ''} will fit on this page
              {currentPageSize.rotated && ' (rotated 90°)'}
            </div>

            {/* Equal Spacing Mode Toggle */}
            <div style={{padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                    type="checkbox"
                    checked={useEqualSpacing}
                    onChange={(e) => handleEqualSpacingChange(e.target.checked)}
                    style={{marginRight: '10px'}}
                />
                <span style={{ fontSize: '14px' }}>Use equal spacing (cards at edges with equal spacing between cards)</span>
              </label>
            </div>

            {/* Single Image Mode Toggle */}
            <div style={{padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                    type="checkbox"
                    checked={useSingleImage}
                    onChange={(e) => setUseSingleImage(e.target.checked)}
                    style={{marginRight: '10px'}}
                />
                <span style={{ fontSize: '14px' }}>Use single image and repeat it across all cards</span>
              </label>

              {useSingleImage && (
                <div style={{marginTop: '10px'}}>
                  <label htmlFor="singleImageUpload" style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Upload Image to Repeat:</label>
                  <input
                      type="file"
                      id="singleImageUpload"
                      accept="image/*"
                      onChange={handleSingleImageUpload}
                      style={{width: '100%'}}
                  />
                </div>
              )}
            </div>

            {/* Card Uploads */}
            {!useSingleImage && (
              <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cardImages.map((_, index) => (
                    <div key={index}>
                      <label htmlFor={`cardUpload${index}`} style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Upload Card {index + 1}:</label>
                      <input
                          type="file"
                          id={`cardUpload${index}`}
                          accept="image/*"
                          onChange={(e) => handleCardUpload(index, e)}
                          style={{width: '100%'}}
                      />
                    </div>
                ))}
              </div>
            )}

            {/* Download Button */}
            <div style={{marginTop: '20px'}}>
              <button onClick={handleDownload} style={{ width: '100%', padding: '12px', fontSize: '16px', cursor: 'pointer' }}>
                Download {pageSize === 'a4' ? 'A4' : '10x15cm'} Page
              </button>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="preview-panel-page">
            <canvas
                ref={canvasRef}
                width={PAGE_WIDTH}
                height={PAGE_HEIGHT}
                style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', border: '1px solid black', objectFit: 'contain' }}
            ></canvas>
          </div>
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
