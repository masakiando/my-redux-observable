import { combineEpics } from 'redux-observable';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import { ajax } from 'rxjs/observable/dom/ajax';

import {
    FETCH_WHISKIES,
    fetchWhiskiesFailure,
    fetchWhiskiesSuccess
} from "../actions";

const url = 'https://evening-citadel-85778.herokuapp.com/whiskey/'; 
/*
    The API returns the data in the following format:
    {
        "count": number,
        "next": "url to next page",
        "previous": "url to previous page",
        "results: array of whiskies
    }
    since we are only interested in the results array we will have to use map on our observable
 */

function fetchWhiskiesEpic(action$) { // action $はアクションのストリームです
    // action $ .ofTypeは外部のObservableです
    console.log(action$);
    return action$
        .ofType(FETCH_WHISKIES) // ofType（FETCH_WHISKIES）は.filter（x => x.type === FETCH_WHISKIES）の単純なバージョンです
        .switchMap(() => {
            // Observableからのajax呼び出しは、observableを返します。これが、内側のObservableを生成する方法です
            return ajax
                .getJSON(url) // getJSONは、Content-Type application / jsonでGETリクエストを送信するだけです
                .map(data => data.results) // データを取得し、結果のみを抽出します
                .map(whiskies => whiskies.map(whisky => ({
                    id: whisky.id,
                    title: whisky.title,
                    imageUrl: whisky.img_url
                })))// ウイスキーを反復処理し、必要なプロパティのみを取得する必要があります
                // 画像URLなしのウイスキーを除外する（便宜上）
                .map(whiskies => whiskies.filter(whisky => !!whisky.imageUrl))
            // 最後に、内側のObservableには、外側のObservableにマージされるウィスキーオブジェクトの配列のストリームがあります
        })
        .map(whiskies => fetchWhiskiesSuccess(whiskies)) // 結果の配列をFETCH_WHISKIES_SUCCESSタイプのアクションにマップします
        // エピックから返されたストリームに含まれるすべてのアクションがReduxにディスパッチされます。これがアクションをストリームにマッピングする理由です。
        // エラーが発生した場合、エラー時にディスパッチされるアクションのObservableを作成します。他の演算子とは異なり、catchはObservableを明示的に返しません。
        .catch(error => Observable.of(fetchWhiskiesFailure(error.message)))
}
export const rootEpic = combineEpics(fetchWhiskiesEpic);