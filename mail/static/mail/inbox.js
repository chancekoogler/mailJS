document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox
  load_mailbox('inbox');
  

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  let recipient = document.querySelector('#compose-recipients')
  let subject = document.querySelector('#compose-subject')
  let body = document.querySelector('#compose-body')

  document.querySelector('form').onsubmit = () => {
    const emailRecipient = recipient.value;
    const emailSubject = subject.value;
    const emailBody = body.value;
    emailRecipient.forEach(emailRecipient => {
      fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: emailRecipient,
        subject: emailSubject,
        body: emailBody
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    })
  })  
  }
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#oneEmail-view').style.display = 'none';
  document.querySelector('#oneEmail-view').innerHTML = "";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  show_Mail(mailbox)
}

function show_Mail(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    displayEmails(emails)
  })
}


function displayEmails(emails) {
  for (i = 0; i < emails.length; i++) {
      let newDiv = document.createElement('div');
      newDiv.className = 'emailInbox';
      newDiv.innerHTML = `<span class="sender">${emails[i].sender}</span>` + `<span class="subject">${emails[i].subject}</span>` + `<span class="time">${emails[i].timestamp}</span>`;
      document.querySelector('#emails-view').append(newDiv);    
      email = document.getElementsByClassName("emailInbox")[i];
      email.style.border = "2px solid black";
      email.style.paddingBottom = "5px";
      email.style.paddingTop = "5px";
      sender = document.querySelectorAll(".sender")[i];
      sender.style.paddingRight = "25px";
      subject = document.querySelectorAll(".subject")[i];
      time = document.querySelectorAll(".time")[i];
      time.style.cssFloat = "right";
      if (emails[i].read === true) {
        newDiv.style.backgroundColor = "Gainsboro";
      }
      if (i != 0) {
        email.style.marginTop = "3px";
      }
      title = document.querySelector('#emails-view h3').innerHTML
      console.log(title)
      let num = emails[i].id;
      document.querySelectorAll('.emailInbox')[i].addEventListener('click', function() {
        singleEmail(emails, num, title);
        console.log(num)
        setRead(emails, num)
      }
      )
      }
    

    }
    
function singleEmail(emails, email_id, title) {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#oneEmail-view').style.display = 'block';
      fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
        const emailDiv = document.createElement('div');
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'emailBody';
        emailDiv.className = 'email';
        emailDiv.id = 'emailDiv';
        emailDiv.innerHTML = `<p><b>From:</b> ${email.sender}</p> <p><b>To:</b> ${email.recipients}</p> <p><b>Subject:</b> ${email.subject}</p> <p><b>Timestamp:</b> ${email.timestamp}</p>`
        document.querySelector('#oneEmail-view').append(emailDiv)
        button = document.createElement('input')    
        button.setAttribute("type", "submit")
        button.setAttribute("value", "Archive")
        button.className = "btn btn-sm btn-outline-primary"
        button.id = "form-button"
        button.style.marginLeft = "2px";
        replyButton = document.createElement('input')
        replyButton.setAttribute("type", "submit")
        replyButton.setAttribute("value", "Reply")
        replyButton.className = "btn btn-sm btn-outline-primary"
        replyButton.id = "replyForm-button"
        emailDiv.append(replyButton, button)
        emailBody = document.createTextNode(email.body)
        document.querySelector('#oneEmail-view').append(bodyDiv)
        emailDiv.style.marginBottom = "25px";
        document.querySelector('.emailBody').appendChild(emailBody)
        
        if (title === 'Sent') {
          form.remove();
          button.remove();
        }
        console.log(email)
        setArchived(email)
        replyToMail(email)
      })
}


function replyToMail(email) {
  document.querySelector('#replyForm-button').addEventListener('click', () => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#oneEmail-view').style.display = 'none';
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.slice(0,4) === 'Re: ') {
        document.querySelector('#compose-subject').value = email.subject
      }
      else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`
      }
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`
  })
}

function setArchived(email) {
  if (email.archived == true) {
    button.setAttribute("value", "Remove From Archive")
    document.querySelector("#form-button").addEventListener('click', () => {
      fetch(`emails/${email.id}`, {
        method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
      return load_mailbox('inbox')
    })
    }
  else {
    document.querySelector("#form-button").addEventListener('click', () => {
      fetch(`emails/${email.id}`, {
        method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
      return load_mailbox('inbox')
    })
    }

  }


function setRead(emails, email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
}
