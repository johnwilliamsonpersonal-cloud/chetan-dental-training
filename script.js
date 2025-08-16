// Progress tracking
  let currentStep = 0;
  const totalSteps = 8; // Updated to include video sections

  // Ring exercise variables
  let ringCount = 0;
  let ringingInterval;
  let hasAnswered = false;
  const phoneRing = new Audio('assets/audio/phone-ring.mp3');

  // Video completion tracking
  let videoCompletions = {
      intro: false,
      ring: false,
      greeting: false,
      audio: false,
      practice: false
  };

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
      updateProgress();
      setupEventListeners();
      setupVideoListeners();
  });

  function setupEventListeners() {
      // Start button (now goes to ring intro video)
      document.getElementById('start-btn').addEventListener('click', function() {
          showSection('ring-intro-video');
          currentStep = 1;
          updateProgress();
      });

      // Video continue buttons
      document.getElementById('continue-to-ring').addEventListener('click', function() {
          showSection('ring-exercise');
          currentStep = 2;
          updateProgress();
      });

      document.getElementById('continue-to-greeting').addEventListener('click', function() {
          showSection('greeting-builder');
          currentStep = 4;
          updateProgress();
          setTimeout(initializeGreetingBuilder, 100);
      });

      document.getElementById('continue-to-audio').addEventListener('click', function() {
          showSection('audio-comparison');
          currentStep = 6;
          updateProgress();
          setTimeout(initializeAudioComparison, 100);
      });

      document.getElementById('continue-to-practice').addEventListener('click', function() {
          showSection('practice-recorder');
          currentStep = 8;
          updateProgress();
          setTimeout(initializePracticeRecorder, 100);
      });

      // Start ringing button
      document.getElementById('start-ringing').addEventListener('click', startRinging);

      // Answer button
      document.getElementById('answer-btn').addEventListener('click', answerPhone);
  }

  function showSection(sectionId) {
      // Stop any ongoing phone ringing
      hasAnswered = true;

      // Hide all sections
      document.querySelectorAll('.section').forEach(section => {
          section.classList.remove('active');
      });

      // Show target section
      document.getElementById(sectionId).classList.add('active');
  }

  function updateProgress() {
      const progressPercent = (currentStep / totalSteps) * 100;
      document.getElementById('progress').style.width = progressPercent + '%';
  }

  // Video event listeners for Wistia players
  function setupVideoListeners() {
      // Wait for Wistia to be ready
      window._wq = window._wq || [];

      // Intro video
      window._wq.push({ id: '6vif2yc5c5', onReady: function(video) {
          video.bind('end', function() {
              markVideoComplete('intro');
          });
      }});

      // Ring video
      window._wq.push({ id: 'ou03n83tjo', onReady: function(video) {
          video.bind('end', function() {
              markVideoComplete('ring');
          });
      }});

      // Greeting video
      window._wq.push({ id: '7be6v4rh7b', onReady: function(video) {
          video.bind('end', function() {
              markVideoComplete('greeting');
          });
      }});

      // Audio video
      window._wq.push({ id: '2yynxcpkld', onReady: function(video) {
          video.bind('end', function() {
              markVideoComplete('audio');
          });
      }});

      // Practice video
      window._wq.push({ id: 'mut2ffueih', onReady: function(video) {
          video.bind('end', function() {
              markVideoComplete('practice');
          });
      }});
  }

  function markVideoComplete(videoType) {
      videoCompletions[videoType] = true;

      // Show completion indicator
      const indicator = document.getElementById(`${videoType}-video-completed`);
      if (indicator) {
          indicator.style.display = 'block';
      }

      // Enable corresponding continue button
      let buttonId = '';
      switch(videoType) {
          case 'intro':
              buttonId = 'start-btn';
              break;
          case 'ring':
              buttonId = 'continue-to-ring';
              break;
          case 'greeting':
              buttonId = 'continue-to-greeting';
              break;
          case 'audio':
              buttonId = 'continue-to-audio';
              break;
          case 'practice':
              buttonId = 'continue-to-practice';
              break;
      }

      const button = document.getElementById(buttonId);
      if (button) {
          button.disabled = false;
          button.classList.add('video-completed');
      }
  }

  function startRinging() {
      // Reset variables
      ringCount = 0;
      hasAnswered = false;

      // Reset UI
      document.getElementById('ring-count').textContent = '0';
      document.getElementById('answer-btn').disabled = true;
      document.getElementById('feedback').innerHTML = '';
      document.getElementById('start-ringing').disabled = true;
      document.getElementById('start-ringing').textContent = 'Ringing...';

      // Function to play one ring
      function playRing() {
          if (ringCount >= 5 || hasAnswered) {
              if (ringCount >= 5) {
                  showFeedback('Too many rings! Patients may hang up. Try again.', 'warning');
                  resetExercise();
              }
              return;
          }

          ringCount++;

          // Play sound and update display - FIXED VERSION for browser compatibility
          phoneRing.currentTime = 0;
          phoneRing.volume = 0.5;

          // Try to play with user interaction context
          const playPromise = phoneRing.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  // Audio play failed - continue anyway, user will see visual feedback
                  console.log('Audio autoplay prevented by browser policy');
              });
          }

          document.getElementById('ring-count').textContent = ringCount;

          // Enable answer button after first ring
          if (ringCount >= 1) {
              document.getElementById('answer-btn').disabled = false;
          }

          // Schedule next ring after audio file duration + small gap
          setTimeout(playRing, 3500);
      }

      // Start first ring after short delay
      setTimeout(playRing, 500);
  }

  function answerPhone() {
      if (hasAnswered) return;

      hasAnswered = true;

      // Provide nuanced feedback based on ring count
      if (ringCount === 1) {
          showFeedback('Wow! You\'re fast off the mark! While quick responses are good, you could use the first 2 rings to take a breath, smile, and prepare for the call. Give it another go!', 'warning');
          setTimeout(resetExercise, 4000);
      } else if (ringCount === 2) {
          showFeedback('Good timing! You\'re answering quickly while giving yourself a moment to prepare. This shows both efficiency and professionalism.', 'success');
          setTimeout(resetExercise, 4000);
      } else if (ringCount === 3) {
          showFeedback('Perfect! Answering by the 3rd ring is the gold standard - it shows professionalism and respect for the patient\'s time while allowing you to be fully prepared.', 'success');
          currentStep = 3;
          updateProgress();
          // Show next section button after perfect answer
          setTimeout(() => {
              document.getElementById('start-ringing').disabled = false;
              document.getElementById('start-ringing').textContent = 'Continue to Greeting Video';
              document.getElementById('start-ringing').onclick = () => {
                  showSection('greeting-intro-video');
              };
          }, 4000);
      } else {
          showFeedback('Good, but try to answer by the 3rd ring. Patients appreciate quick responses and may hang up if they wait too long.', 'warning');
          setTimeout(resetExercise, 4000);
      }
  }

  function showFeedback(message, type) {
      const feedback = document.getElementById('feedback');
      feedback.innerHTML = message;
      feedback.className = 'feedback ' + type;
  }

  function resetExercise() {
      document.getElementById('start-ringing').disabled = false;
      document.getElementById('start-ringing').textContent = 'Try Again';
      document.getElementById('answer-btn').disabled = true;
  }

  // Greeting Builder functionality
  let draggedElement = null;
  let greetingOrder = [null, null, null, null];

  function initializeGreetingBuilder() {
      console.log('Initializing greeting builder...');

      const components = document.querySelectorAll('.component');
      const dropSlots = document.querySelectorAll('.drop-slot');
      const checkButton = document.getElementById('check-greeting');

      if (components.length === 0 || dropSlots.length === 0 || !checkButton) {
          console.log('Elements not ready, trying again in 500ms...');
          setTimeout(initializeGreetingBuilder, 500);
          return;
      }

      components.forEach(component => {
          component.addEventListener('dragstart', handleDragStart);
          component.addEventListener('dragend', handleDragEnd);
      });

      dropSlots.forEach(slot => {
          slot.addEventListener('dragover', handleDragOver);
          slot.addEventListener('drop', handleDrop);
          slot.addEventListener('dragenter', handleDragEnter);
          slot.addEventListener('dragleave', handleDragLeave);
      });

      checkButton.addEventListener('click', checkGreeting);
      console.log('Greeting builder initialized successfully!');
  }

  function handleDragStart(e) {
      draggedElement = e.target;
      e.target.classList.add('dragging');
  }

  function handleDragEnd(e) {
      e.target.classList.remove('dragging');
      draggedElement = null;
  }

  function handleDragOver(e) {
      e.preventDefault();
  }

  function handleDragEnter(e) {
      if (e.target.classList.contains('drop-slot') && !e.target.classList.contains('filled')) {
          e.target.classList.add('drag-over');
      }
  }

  function handleDragLeave(e) {
      e.target.classList.remove('drag-over');
  }

  function handleDrop(e) {
      e.preventDefault();
      e.target.classList.remove('drag-over');

      if (draggedElement && e.target.classList.contains('drop-slot') && !e.target.classList.contains('filled')) {
          const slotPosition = parseInt(e.target.dataset.position) - 1;
          const componentOrder = parseInt(draggedElement.dataset.order);

          e.target.innerHTML = draggedElement.outerHTML;
          e.target.classList.add('filled');
          draggedElement.style.display = 'none';
          greetingOrder[slotPosition] = componentOrder;

          if (greetingOrder.every(slot => slot !== null)) {
              document.getElementById('check-greeting').disabled = false;
          }
      }
  }

  function checkGreeting() {
      const correctOrder = [1, 2, 3, 4];
      const isCorrect = greetingOrder.every((order, index) => order === correctOrder[index]);

      if (isCorrect) {
          showGreetingFeedback('Perfect! You\'ve mastered the 4-part greeting structure. This professional approach will make every patient feel welcomed and valued.', 'success');
          document.getElementById('next-section').style.display = 'inline-block';
          document.getElementById('next-section').textContent = 'Continue to Audio Video';
          document.getElementById('next-section').onclick = () => {
              showSection('audio-intro-video');
              currentStep = 5;
              updateProgress();
          };
      } else {
          showGreetingFeedback('Not quite right. Remember the order: Time of day → Practice name → Your name → How you can help. Try rearranging!', 'warning');
          resetGreetingBuilder();
      }
  }

  function showGreetingFeedback(message, type) {
      const feedback = document.getElementById('greeting-feedback');
      feedback.innerHTML = message;
      feedback.className = 'feedback ' + type;
  }

  function resetGreetingBuilder() {
      document.querySelectorAll('.drop-slot').forEach(slot => {
          slot.classList.remove('filled');
          slot.innerHTML = slot.dataset.position === '1' ? 'Drop first part here' :
                          slot.dataset.position === '2' ? 'Drop second part here' :
                          slot.dataset.position === '3' ? 'Drop third part here' :
                          'Drop fourth part here';
      });

      document.querySelectorAll('.component').forEach(component => {
          component.style.display = 'block';
      });

      greetingOrder = [null, null, null, null];
      document.getElementById('check-greeting').disabled = true;
  }

  // Audio Comparison functionality
  let audioRatings = [0, 0, 0];
  let ratingsComplete = 0;

  function initializeAudioComparison() {
      console.log('Initializing audio comparison...');

      const stars = document.querySelectorAll('.star');

      if (stars.length === 0) {
          console.log('Stars not ready, trying again...');
          setTimeout(initializeAudioComparison, 500);
          return;
      }

      stars.forEach(star => {
          star.addEventListener('click', handleStarClick);
      });

      console.log('Audio comparison initialized!');
  }

  function handleStarClick(e) {
      const clickedStar = e.target;
      const rating = parseInt(clickedStar.dataset.value);
      const starContainer = clickedStar.parentElement;
      const exampleCard = starContainer.closest('.audio-card');
      const exampleNumber = parseInt(exampleCard.dataset.example);

      audioRatings[exampleNumber - 1] = rating;

      // Update star display
      const stars = starContainer.querySelectorAll('.star');
      stars.forEach((star, index) => {
          if (index < rating) {
              star.classList.add('active');
          } else {
              star.classList.remove('active');
          }
      });

      // Show feedback
      showAudioFeedback(exampleCard, exampleNumber, rating);

      // Check if all rated
      ratingsComplete = audioRatings.filter(r => r > 0).length;
      if (ratingsComplete === 3) {
          document.getElementById('audio-continue').style.display = 'inline-block';
          document.getElementById('audio-continue').textContent = 'Continue to Practice Video';
          document.getElementById('audio-continue').onclick = () => {
              showSection('practice-intro-video');
              currentStep = 7;
              updateProgress();
          };
      }
  }

  function showAudioFeedback(exampleCard, exampleNumber, rating) {
      const feedbackDiv = exampleCard.querySelector('.feedback-text');
      let message = '';
      let className = '';

      if (exampleNumber === 1) {
          if (rating <= 2) {
              message = "Exactly! This rushed greeting sounds unprofessional and hard to understand.";
              className = "excellent";
          } else {
              message = "This greeting is too rushed and unprofessional for patient care.";
              className = "poor";
          }
      } else if (exampleNumber === 2) {
          if (rating <= 3) {
              message = "Good assessment! Technically correct but lacks warmth.";
              className = "excellent";
          } else {
              message = "This greeting lacks the warmth patients need to feel welcomed.";
              className = "good";
          }
      } else if (exampleNumber === 3) {
          if (rating >= 4) {
              message = "Perfect! Notice the warmth and professionalism in this greeting.";
              className = "excellent";
          } else {
              message = "Listen again - this greeting has ideal warmth and professionalism!";
              className = "poor";
          }
      }

      feedbackDiv.innerHTML = message;
      feedbackDiv.className = `feedback-text ${className}`;
      feedbackDiv.style.display = 'block';
  }
  // Practice Recorder functionality
  let mediaRecorder;
  let recordedChunks = [];
  let isRecording = false;

  function initializePracticeRecorder() {
      console.log('Initializing practice recorder...');

      const startBtn = document.getElementById('start-recording');
      const stopBtn = document.getElementById('stop-recording');
      const tryAgainBtn = document.getElementById('try-again');
      const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');

      if (!startBtn || !stopBtn) {
          console.log('Recorder elements not ready, trying again...');
          setTimeout(initializePracticeRecorder, 500);
          return;
      }

      startBtn.addEventListener('click', startRecording);
      stopBtn.addEventListener('click', stopRecording);
      tryAgainBtn.addEventListener('click', resetRecorder);

      checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', updateAssessment);
      });

      console.log('Practice recorder initialized successfully!');
  }

  async function startRecording() {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

          recordedChunks = [];
          mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  recordedChunks.push(event.data);
              }
          };

          mediaRecorder.onstop = () => {
              const blob = new Blob(recordedChunks, { type: 'audio/wav' });
              const audioURL = URL.createObjectURL(blob);

              const audioElement = document.getElementById('recorded-audio');
              audioElement.src = audioURL;

              document.getElementById('playback-area').style.display = 'block';
              document.getElementById('self-assessment').style.display = 'block';

              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          isRecording = true;

          document.getElementById('start-recording').disabled = true;
          document.getElementById('stop-recording').disabled = false;
          document.getElementById('start-recording').classList.add('recording');
          document.getElementById('recording-status').textContent = '🔴 Recording... Speak your greeting now!';

      } catch (error) {
          console.error('Error accessing microphone:', error);
          alert('Unable to access microphone. Please check your browser permissions and try again.');
      }
  }

  function stopRecording() {
      if (mediaRecorder && isRecording) {
          mediaRecorder.stop();
          isRecording = false;

          document.getElementById('start-recording').disabled = false;
          document.getElementById('stop-recording').disabled = true;
          document.getElementById('start-recording').classList.remove('recording');
          document.getElementById('recording-status').textContent = '✅ Recording complete! Listen to your greeting below.';
      }
  }

  function resetRecorder() {
      document.getElementById('playback-area').style.display = 'none';
      document.getElementById('self-assessment').style.display = 'none';
      document.getElementById('start-recording').disabled = false;
      document.getElementById('stop-recording').disabled = true;
      document.getElementById('start-recording').classList.remove('recording');
      document.getElementById('recording-status').textContent = '';

      document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
      });

      document.getElementById('complete-module').style.display = 'none';
      document.getElementById('assessment-feedback').innerHTML = '';
  }

  function updateAssessment() {
      const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
      const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
      const totalCount = checkboxes.length;

      const feedbackDiv = document.getElementById('assessment-feedback');
      const completeBtn = document.getElementById('complete-module');

      if (checkedCount === 0) {
          feedbackDiv.innerHTML = '';
          completeBtn.style.display = 'none';
      } else if (checkedCount === totalCount) {
          feedbackDiv.innerHTML = 'Excellent! You\'ve mastered all the key elements of a perfect greeting. You\'re ready to provide outstanding patient service!';
          feedbackDiv.className = 'feedback success';
          completeBtn.style.display = 'inline-block';
          completeBtn.onclick = () => showSection('completion');
      } else if (checkedCount >= 3) {
          feedbackDiv.innerHTML = `Great progress! You\'ve got ${checkedCount} out of ${totalCount} elements right. Practice the areas you haven\'t checked to perfect your greeting.`;
          feedbackDiv.className = 'feedback good';
          completeBtn.style.display = 'none';
      } else {
          feedbackDiv.innerHTML = `Keep practicing! Focus on the areas you haven\'t checked. Remember: ${totalCount - checkedCount} areas still need work.`;
          feedbackDiv.className = 'feedback warning';
          completeBtn.style.display = 'none';
      }
  }
