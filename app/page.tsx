export default function Home() {
  return (
    <div>
      <h1>ebird dashboard</h1>
      <div className="w-full">
        <div className="join stats stats-border shadow-none">
          <div className="stat">
            <div className="stat-desc">Region</div>
            <div className="stat-value">All time</div>
            <div className="stat-title">Year record</div>
            <div className="stat-title">This year <span className="text-gray-400">(predicted)</span></div>
          </div>
          <div className="stat">
            <div className="stat-desc">UK</div>
            <div className="stat-value">76,250</div>
            <div className="stat-title">308</div>
            <div className="stat-title">150 <span className="text-gray-400">(200)</span></div>
          </div>
          <div className="stat">
            <div className="stat-desc">London</div>
            <div className="stat-value">76,250</div>
            <div className="stat-title">308</div>
            <div className="stat-title">150 <span className="text-gray-400">(200)</span></div>
          </div>
          <div className="stat">
            <div className="stat-desc">Marshes</div>
            <div className="stat-value">76,250</div>
            <div className="stat-title">308</div>
            <div className="stat-title">150 <span className="text-gray-400">(200)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}




