$(document).ready(function() {
    $('#executeBtn').click(function() {
      // 選択されたAPIの種類を取得
      var apiType = $('#apiSelect').val();
      // 検索クエリ（Browse API用）と取得件数を取得
      var query = $('#queryInput').val() || '';
      var limit = $('#limitInput').val() || 10;
      
      // サーバー側に送るデータをまとめる
      var requestData = {
        api: apiType,
        q: query,
        limit: limit
      };
      
      // 結果表示用テキストエリアを「Loading...」に更新
      $('#resultBox').val("Loading...");
      
      // サーバー側のエンドポイント (/api/ebay) にAJAXリクエスト送信
      $.ajax({
        url: 'http://localhost:3000/api/ebay',
        method: 'GET',
        data: requestData,
        success: function(response) {
          // 取得したJSONデータを整形してテキストエリアに表示
          $('#resultBox').val(JSON.stringify(response, null, 4));
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('#resultBox').val("Error: " + textStatus + "\n" + errorThrown);
        }
      });
    });
  });
  