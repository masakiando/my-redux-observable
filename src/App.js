import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import './App.css';

import { fetchWhiskies } from './actions';

import WhiskyGrid from './components/WhiskyGrid';

const App = () => {
    const dispatch = useDispatch();
    const { isLoading, error, whiskies } = useSelector(store => ({...store}));

    return (
      <div className="App">
        <button onClick={() => dispatch(fetchWhiskies())}>Fetch whiskies+</button>
        {isLoading && <h1>Fetching data</h1>}
        {!isLoading && !error && <WhiskyGrid whiskies={whiskies} />}
        {error && <h1>{error}</h1>}
      </div>
    );
}

export default App;
