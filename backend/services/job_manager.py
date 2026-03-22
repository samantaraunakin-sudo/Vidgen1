import uuid
import threading
from datetime import datetime
from typing import Dict, Any, Optional

class JobManager:
    """
    Manages background processing jobs.
    """
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}

    def create_job(self, job_type: str) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "jobId": job_id,
            "type": job_type,
            "status": "pending",
            "progress": 0,
            "message": "Queued",
            "startTime": datetime.now().isoformat(),
            "endTime": None,
            "result": None,
            "error": None
        }
        return job_id

    def update_job(self, job_id: str, status: str = None, progress: int = None, message: str = None, result: Any = None, error: str = None):
        if job_id not in self.jobs:
            return
        
        if status:
            self.jobs[job_id]["status"] = status
        if progress is not None:
            self.jobs[job_id]["progress"] = progress
        if message:
            self.jobs[job_id]["message"] = message
        if result:
            self.jobs[job_id]["result"] = result
        if error:
            self.jobs[job_id]["error"] = error
            self.jobs[job_id]["status"] = "failed"
            self.jobs[job_id]["endTime"] = datetime.now().isoformat()
        
        if status == "completed":
            self.jobs[job_id]["progress"] = 100
            self.jobs[job_id]["endTime"] = datetime.now().isoformat()

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.jobs.get(job_id)

# Singleton instance
job_manager = JobManager()
