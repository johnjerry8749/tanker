jQuery(document).ready(($) => {
  $(".rform-button-submit").on("click", function (event) {
    event.preventDefault();
    var form = $(this).closest("form");
    var form_id = form.attr("data-form");
    if (form.hasClass("rform-dsb")) {
      var m = form.find(".require-login");
      m.css("display", "block");
    } else {
      form.find(".rform-select").each(function () {
        if ($(this).is("[required]")) {
          var value = $(this)
            .closest(".rform-select-container")
            .find(".rform-select-input")
            .val();
          if (value === "") {
            $(this).attr("aria-invalid", "true");
          } else {
            $(this).attr("aria-invalid", "false");
          }
        }
      });
      if (form[0].checkValidity()) {
        if (form.find("[aria-invalid= true]").length == 0) {
          // console.log('Form Valid');

          $(this).prop("disabled", true);

          let current_html = $(this).html();

          $(this).html(`<div class="loading"><div id="loading"></div>Sending...</div>`);
          var data = form.serializeArray();
          var serializedInputs = {};
          var nonce = romethemeform_ajax_url.nonce;
          $(data).each(function (index, obj) {
            if (serializedInputs[obj.name] !== undefined) {
              if (!Array.isArray(serializedInputs[obj.name])) {
                serializedInputs[obj.name] = [serializedInputs[obj.name]];
              }
              serializedInputs[obj.name].push(obj.value);
            } else {
              serializedInputs[obj.name] = obj.value;
            }
          });

          var jsonString = JSON.stringify(serializedInputs);
          var data_sending = {
            action: "rformsendform",
            id: form_id,
            data: jsonString,
            email: form.find('input[type="email"]').val(),
            nonce: nonce,
            page: window.location.href,
          };
          // console.log(data_sending);
          sending_form(data_sending, $(this) , current_html);
        } else {
          form.find(":invalid").each(function () {
            $(this).attr("aria-invalid", "true");
          });
        }
      } else {
        form.find(":invalid").each(function () {
          $(this).attr("aria-invalid", "true");
        });
      }
    }
  });
  $(".close-msg").click(function (event) {
    event.preventDefault();
    var msg = $(this).closest(".msg");
    msg.css("display", "none");
  });
});

function sending_form(data, btn, current_html) {
    console.log("Submitting data:", data); // Debug output
    
    $.ajax({
        type: "POST",
        url: "/process_form.php",
        contentType: "application/json",
        data: JSON.stringify(data),
        timeout: 10000, // 10 second timeout
        beforeSend: function() {
            console.log("AJAX request started");
        },
        success: function(response) {
            console.log("Server response:", response);
            
            btn.prop("disabled", false);
            btn.html(current_html);
            
            if (response.success) {
                btn.closest("form").find(".success-submit").css("display", "block");
                btn.closest("form")[0].reset();
            } else {
                // Handle errors
                if (response.errors) {
                    Object.entries(response.errors).forEach(([field, message]) => {
                        const errorEl = $(`#rform-input-err-${field}`);
                        if (errorEl.length) {
                            errorEl.text(message).show();
                            $(`[name="${field}"]`).addClass('error');
                        }
                    });
                }
                alert(response.message || 'Form submission failed');
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error:", status, error);
            btn.prop("disabled", false);
            btn.html(current_html);
            
            if (status === "timeout") {
                alert("Request timed out. Please try again.");
            } else {
                alert("Error: " + error);
            }
        },
        complete: function() {
            console.log("AJAX request completed");
        }
    });
}