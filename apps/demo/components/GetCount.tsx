import useCount from '../states/stores/count';
import useCountAsync from '../states/stores/count-async';
import useCountPersisted from '../states/stores/count-persisted';

function GetCount() {
  const [count] = useCount();
  const [countPersist] = useCountPersisted();
  const [countAsync] = useCountAsync();

  return (
    <div>
      <p>
        Current Count: {count}
        <br />
        Current Count (Persisted): {countPersist}
        <br />
        Current Count (Async): {countAsync}
      </p>
    </div>
  );
}

export default GetCount;
