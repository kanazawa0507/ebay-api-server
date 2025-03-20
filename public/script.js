$(document).ready(function() {
  $('#executeBtn').click(function() {
      // 選択されたAPIの種類を取得
      var apiType = $('#apiSelect').val();
      var query = $('#queryInput').val().trim();
      var limit = $('#limitInput').val() || 10;

      // サーバーへ送るリクエストデータ
      var requestData = {
          api: apiType,
          q: query,
          limit: limit
      };

      // UIの更新（ボタン無効化・ローディング表示）
      $('#executeBtn').prop('disabled', true).text("実行中...");
      $('#loading').show();
      $('#resultBox').val("Loading...");

      // AJAXリクエスト
      $.ajax({
          url: 'https://ebay-api-server.vercel.app/api/ebay',
          method: 'GET',
          data: requestData,
          success: function(response) {
              $('#resultBox').val(JSON.stringify(response, null, 4));
              showClearButton();
          },
          error: function(jqXHR, textStatus, errorThrown) {
              var errorMessage = "Error: " + textStatus + "\n" + (jqXHR.responseJSON ? JSON.stringify(jqXHR.responseJSON, null, 4) : errorThrown);
              $('#resultBox').val(errorMessage);
          },
          complete: function() {
              $('#executeBtn').prop('disabled', false).text("実行");
              $('#loading').hide();
          }
      });
  });

  // 結果をクリアするボタンを表示
  function showClearButton() {
      if ($('#clearBtn').length === 0) {
          $('<button id="clearBtn">クリア</button>')
              .insertAfter('#executeBtn')
              .click(function() {
                  $('#resultBox').val("");
                  $(this).remove();
              });
      }
  }
});
