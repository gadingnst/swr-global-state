import useCount from '../states/stores/count';
import useCountPersisted from '../states/stores/count-persisted';

function GetCount() {
  const [count] = useCount();
  const [countPersist] = useCountPersisted();

  return (
    <div>
      <p>
        Current Count: {count}
        <br />
        Current Count (Persisted): {countPersist}
      </p>
    </div>
  );
}

export default GetCount;
