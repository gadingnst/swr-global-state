import useCount from '../states/stores/count';
import useCountPersisted from '../states/stores/count-persisted';
import useCountAsync from '../states/stores/count-async';

function SetCount() {
  const [, setCount] = useCount();
  const [, setCountPersisted] = useCountPersisted();
  const [, setCountAsync] = useCountAsync();

  const decreaseCount = () => {
    setCount(prev => prev - 1);
    setCountPersisted(prev => prev - 1);
    setCountAsync(prev => prev - 1);
  };

  const increaseCount = () => {
    setCount(prev => prev + 1);
    setCountPersisted(prev => prev + 1);
    setCountAsync(prev => prev + 1);
  };

  return (
    <div>
      <button onClick={decreaseCount}>
        (-) Decrease Count
      </button>
      &nbsp;
      <button onClick={increaseCount}>
        (+) Increase Count
      </button>
    </div>
  );
}

export default SetCount;
