function passwordCheck() {
				var input = checkStrength(document.getElementById('password').value);
				var res = document.getElementById('Submit');
				res.innerHTML = input;
			  }
			  
			  
function checkStrength(password) {
	var res = document.getElementById('Submit');
	var strength = 0;
	if(password.length < 6) {
	  res.className = 'short';
	  return 'Too Short'
	}
	if(password.length > 7) strength += 1;
	// If password contains both lower and uppercase characters, increase strength value.
	if(password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1;
	// If it has numbers and characters, increase strength value.
	if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1;
	// If it has one special character, increase strength value.
	if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
	// If it has two special characters, increase strength value.
	if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
	// Calculated strength value, we can return messages
	// If value is less than 2
	if (strength < 2) {
	  res.className = 'weak';
	  return 'Weak';
	} else if (strength == 2) {
	  res.className = 'good';
	  return 'Good';
	} else {
	  res.className = 'strong';
	  return 'Strong';
	}
  }
			  