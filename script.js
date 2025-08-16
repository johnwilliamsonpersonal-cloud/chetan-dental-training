// Fresh start - Clean script for dental training system with Wistia videos

  // Progress tracking
  let currentStep = 0;
  const totalSteps = 8;

  // Video completion tracking
  let videoCompletions = {
      intro: false,
      ring: false,
      greeting: false,
      audio: false,
      practice: false
  };

  // Ring exercise variables
  let ringCount = 0;
  let hasAnswered = false;
  let phoneRing = new Audio('assets/audio/phone-ring.mp3');

  // Greeting builder variables
  let draggedElement = null;
  let greetingOrder = [null, null, null, null];

  // Audio comparison variables
  let audioRatings = [0, 0, 0];

  // Recording variables
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;

  // Initialize everything when page loads
  document.addEventListener('DOMContentLoaded', function() {
      console.log('Initializing dental training system...');
      setupBasicEventListeners();
      setupWistiaVideos();
      updateProgress();
  });

  // Set up basic navigation and exercise buttons
  function setupBasicEventListeners() {
      // Main navigation buttons
      document.getElementById('start-btn').addEventListener('click', () => {
          goToSection('ring-intro-video', 1);
      });

      document.getElementById('continue-to-ring').addEventListener('click', () => {
          goToSection('ring-exercise', 2);
      });

      document.getElementById('continue-to-greeting').addEventListener('click', () => {
          goToSection('greeting-builder', 4);
          setTimeout(initializeGreetingBuilder, 100);
      });

      document.getElementById('continue-to-audio').addEventListener('click', () => {
          goToSection('audio-comparison', 6);
          setTimeout(initializeAudioComparison, 100);
      });

      document.getElementById('continue-to-practice').addEventListener('click', () => {
          goToSection('practice-recorder', 8);
          setTimeout(initializePracticeRecorder, 100);
      });

      // Ring exercise buttons
      document.getElementById('start-ringing').addEventListener('click', startPhoneRinging);
      document.getElementById('answer-btn').addEventListener('click', answerPhone);
  }

  // Updated Wistia video setup for wistia-player elements
  function setupWistiaVideos() {
      // Configure Wistia players using the new method
      window.wistiaOptions = window.wistiaOptions || {};

      // Set up each video with completion tracking
      const videoConfigs = {
          '6vif2yc5c5': { buttonId: 'start-btn', videoType: 'intro' },
          'ou03n83tjo': { buttonId: 'continue-to-ring', videoType: 'ring' },
          '7be6v4rh7b': { buttonId: 'continue-to-greeting', videoType: 'greeting' },
          '2yynxcpkld': { buttonId: 'continue-to-audio', videoType: 'audio' },
          'mut2ffueih': { buttonId: 'continue-to-practice', videoType: 'practice' }
      };

      // Wait for players to be ready and bind events
      setTimeout(() => {
          Object.keys(videoConfigs).forEach(videoId => {
              const config = videoConfigs[videoId];

              // Try to get the Wistia player
              if (window.Wistia && window.Wistia.api) {
                  const video = window.Wistia.api(videoId);
                  if (video) {
                      console.log(`${config.videoType} video ready`);
                      video.bind('end', function() {
                          console.log(`${config.videoType} video ended`);
                          enableButton(config.buttonId, config.videoType);
                      });
                  } else {
                      console.log(`Waiting for ${config.videoType} video...`);
                      // Retry in 2 seconds if video not ready
                      setTimeout(() => {
                          const retryVideo = window.Wistia.api(videoId);
                          if (retryVideo) {
                              retryVideo.bind('end', function() {
                                  enableButton(config.buttonId, config.videoType);
                              });
                          }
                      }, 2000);
                  }
              }
          });
      }, 1000);
  }

  // Enable button after video completion
  function enableButton(buttonId, videoType) {
      console.log(`Video completed: ${videoType}`);
      videoCompletions[videoType] = true;

      // Show completion indicator
      const indicator = document.getElementById(`${videoType}-video-completed`);
      if (indicator) {
          indicator.style.display = 'block';
      }

      // Enable button
      const button = document.getElementById(buttonId);
      if (button) {
          button.disabled = false;
          button.classList.add('video-completed');
          console.log(`Button ${buttonId} enabled`);
      }
  }

  // Navigate to section and update progress
  function goToSection(sectionId, step) {
      // Hide all sections
      document.querySelectorAll('.section').forEach(section => {
          section.classList.remove('active');
      });

      // Show target section
      document.getElementById(sectionId).classList.add('active');

      // Update progress
      currentStep = step;
      updateProgress();

      // Stop any phone ringing
      hasAnswered = true;
  }

  function updateProgress() {
      const progressPercent = (currentStep / totalSteps) * 100;
      document.getElementById('progress').style.width = progressPercent + '%';
  }

  // === PHONE RINGING EXERCISE ===
  function startPhoneRinging() {
      console.log('Starting phone ringing exercise');

      // Reset everything
      ringCount = 0;
      hasAnswered = false;

      // Update UI
      document.getElementById('ring-count').textContent = '0';
      document.getElementById('answer-btn').disabled = true;
      document.getElementById('feedback').innerHTML = '';
      document.getElementById('start-ringing').disabled = true;
      document.getElementById('start-ringing').textContent = 'Ringing...';

      // Set up audio
      phoneRing.volume = 0.7;
      phoneRing.currentTime = 0;

      // Start ringing sequence
      setTimeout(playNextRing, 500);
  }

  function playNextRing() {
      if (ringCount >= 5 || hasAnswered) {
          if (ringCount >= 5) {
              showFeedback('Too many rings! Patients may hang up. Try again.', 'warning');
              resetRingExercise();
          }
          return;
      }

      ringCount++;
      console.log(`Ring ${ringCount}`);

      // Play phone ring sound
      phoneRing.currentTime = 0;
      phoneRing.play().catch(error => {
          console.log('Audio blocked by browser - continuing with visual feedback');
      });

      // Update display
      document.getElementById('ring-count').textContent = ringCount;

      // Enable answer button after first ring
      if (ringCount >= 1) {
          document.getElementById('answer-btn').disabled = false;
      }

      // Schedule next ring
      setTimeout(playNextRing, 3500);
  }

  function answerPhone() {
      if (hasAnswered) return;

      hasAnswered = true;
      console.log(`Phone answered on ring ${ringCount}`);

      if (ringCount === 1) {
          showFeedback('Wow! You\'re fast off the mark! While quick responses are good, you could use the first 2 rings to take a breath, smile, and prepare for the call. Give it another go!', 'warning');
          setTimeout(resetRingExercise, 4000);
      } else if (ringCount === 2) {
          showFeedback('Good timing! You\'re answering quickly while giving yourself a moment to prepare. This shows both efficiency and professionalism.', 'success');
          setTimeout(resetRingExercise, 4000);
      } else if (ringCount === 3) {
          showFeedback('Perfect! Answering by the 3rd ring is the gold standard - it shows professionalism and respect for the patient\'s time while allowing you to be fully prepared.', 'success');
          currentStep = 3;
          updateProgress();
          setTimeout(() => {
              document.getElementById('start-ringing').disabled = false;
              document.getElementById('start-ringing').textContent = 'Continue to Greeting Video';
              document.getElementById('start-ringing').onclick = () => {
                  goToSection('greeting-intro-video', 3);
              };
          }, 4000);
      } else {
          showFeedback('Good, but try to answer by the 3rd ring. Patients appreciate quick responses and may hang up if they wait too long.', 'warning');
          setTimeout(resetRingExercise, 4000);
      }
  }

  function resetRingExercise() {
      document.getElementById('start-ringing').disabled = false;
      document.getElementById('start-ringing').textContent = 'Try Again';
      document.getElementById('answer-btn').disabled = true;
  }

  function showFeedback(message, type) {
      const feedback = document.getElementById('feedback');
      feedback.innerHTML = message;
      feedback.className = 'feedback ' + type;
  }

  // === GREETING BUILDER ===
  function initializeGreetingBuilder() {
      console.log('Initializing greeting builder...');

      const components = document.querySelectorAll('.component');
      const dropSlots = document.querySelectorAll('.drop-slot');
      const checkButton = document.getElementById('check-greeting');

      if (components.length === 0 || !checkButton) {
          setTimeout(initializeGreetingBuilder, 500);
          return;
      }

      // Set up drag and drop
      components.forEach(component => {
          component.addEventListener('dragstart', (e) => {
              draggedElement = e.target;
              e.target.classList.add('dragging');
          });

          component.addEventListener('dragend', (e) => {
              e.target.classList.remove('dragging');
              draggedElement = null;
          });
      });

      dropSlots.forEach(slot => {
          slot.addEventListener('dragover', (e) => e.preventDefault());
          slot.addEventListener('dragenter', (e) => {
              if (e.target.classList.contains('drop-slot') && !e.target.classList.contains('filled')) {
                  e.target.classList.add('drag-over');
              }
          });
          slot.addEventListener('dragleave', (e) => e.target.classList.remove('drag-over'));
          slot.addEventListener('drop', handleDrop);
      });

      checkButton.addEventListener('click', checkGreeting);
      console.log('Greeting builder ready!');
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

          // Enable check button if all slots filled
          if (greetingOrder.every(slot => slot !== null)) {
              document.getElementById('check-greeting').disabled = false;
          }
      }
  }

  function checkGreeting() {
      const correctOrder = [1, 2, 3, 4];
      const isCorrect = greetingOrder.every((order, index) => order === correctOrder[index]);

      const feedback = document.getElementById('greeting-feedback');
      if (isCorrect) {
          feedback.innerHTML = 'Perfect! You\'ve mastered the 4-part greeting structure.';
          feedback.className = 'feedback success';
          document.getElementById('next-section').style.display = 'inline-block';
          document.getElementById('next-section').onclick = () => {
              goToSection('audio-intro-video', 5);
          };
      } else {
          feedback.innerHTML = 'Not quite right. Remember: Time → Practice → Name → Question. Try again!';
          feedback.className = 'feedback warning';
          resetGreetingBuilder();
      }
  }

  function resetGreetingBuilder() {
      document.querySelectorAll('.drop-slot').forEach((slot, index) => {
          slot.classList.remove('filled');
          const positions = ['first', 'second', 'third', 'fourth'];
          slot.innerHTML = `Drop ${positions[index]} part here`;
      });

      document.querySelectorAll('.component').forEach(component => {
          component.style.display = 'block';
      });

      greetingOrder = [null, null, null, null];
      document.getElementById('check-greeting').disabled = true;
  }

  // === AUDIO COMPARISON ===
  function initializeAudioComparison() {
      console.log('Initializing audio comparison...');

      const stars = document.querySelectorAll('.star');

      if (stars.length === 0) {
          setTimeout(initializeAudioComparison, 500);
          return;
      }

      stars.forEach(star => {
          star.addEventListener('click', handleStarClick);
      });

      console.log('Audio comparison ready!');
  }

  function handleStarClick(e) {
      const rating = parseInt(e.target.dataset.value);
      const starContainer = e.target.parentElement;
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

      // Check if all examples rated
      const ratingsComplete = audioRatings.filter(r => r > 0).length;
      if (ratingsComplete === 3) {
          const continueBtn = document.getElementById('audio-continue');
          continueBtn.style.display = 'inline-block';
          continueBtn.onclick = () => goToSection('practice-intro-video', 7);
      }
  }

  function showAudioFeedback(exampleCard, exampleNumber, rating) {
      const feedbackDiv = exampleCard.querySelector('.feedback-text');
      let message = '';
      let className = '';

      if (exampleNumber === 1) {
          if (rating <= 2) {
              message = "Exactly! This rushed greeting sounds unprofessional.";
              className = "excellent";
          } else {
              message = "This greeting is too rushed for patient care.";
              className = "poor";
          }
      } else if (exampleNumber === 2) {
          if (rating <= 3) {
              message = "Good assessment! Technically correct but lacks warmth.";
              className = "excellent";
          } else {
              message = "This greeting lacks warmth patients need.";
              className = "good";
          }
      } else if (exampleNumber === 3) {
          if (rating >= 4) {
              message = "Perfect! Notice the warmth and professionalism.";
              className = "excellent";
          } else {
              message = "Listen again - this has ideal warmth and professionalism!";
              className = "poor";
          }
      }

      feedbackDiv.innerHTML = message;
      feedbackDiv.className = `feedback-text ${className}`;
      feedbackDiv.style.display = 'block';
  }

  // === PRACTICE RECORDER ===
  function initializePracticeRecorder() {
      console.log('Initializing practice recorder...');

      const startBtn = document.getElementById('start-recording');
      const stopBtn = document.getElementById('stop-recording');
      const tryAgainBtn = document.getElementById('try-again');
      const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');

      if (!startBtn || !stopBtn) {
          setTimeout(initializePracticeRecorder, 500);
          return;
      }

      startBtn.addEventListener('click', startRecording);
      stopBtn.addEventListener('click', stopRecording);
      tryAgainBtn.addEventListener('click', resetRecorder);

      checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', updateAssessment);
      });

      console.log('Practice recorder ready!');
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

              document.getElementById('recorded-audio').src = audioURL;
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
          alert('Unable to access microphone. Please check browser permissions.');
      }
  }

  function stopRecording() {
      if (mediaRecorder && isRecording) {
          mediaRecorder.stop();
          isRecording = false;

          document.getElementById('start-recording').disabled = false;
          document.getElementById('stop-recording').disabled = true;
          document.getElementById('start-recording').classList.remove('recording');
          document.getElementById('recording-status').textContent = '✅ Recording complete!';
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
          feedbackDiv.innerHTML = 'Excellent! You\'ve mastered all key elements. Ready for outstanding patient service!';
          feedbackDiv.className = 'feedback success';
          completeBtn.style.display = 'inline-block';
          completeBtn.onclick = () => goToSection('completion', 8);
      } else if (checkedCount >= 3) {
          feedbackDiv.innerHTML = `Great progress! ${checkedCount}/${totalCount} elements mastered.`;
          feedbackDiv.className = 'feedback good';
          completeBtn.style.display = 'none';
      } else {
          feedbackDiv.innerHTML = `Keep practicing! Focus on the ${totalCount - checkedCount} areas you haven't checked.`;
          feedbackDiv.className = 'feedback warning';
          completeBtn.style.display = 'none';
      }
  }
