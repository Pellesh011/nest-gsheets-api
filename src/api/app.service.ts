import { Injectable } from '@nestjs/common';
import { IStatistics } from 'src/types/statistics';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getStatisticsData(): Promise<IStatistics[]> {
    const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLipNAhQDMRQ4q7uheBZviSoZQX4L0kFO15W6mZ15oAb0EL0oG21P_-atwAoTnzbiAIJJ98mUeB512gaPVOg1Px7v-PwsKT-0z7EuPCPl1A6517nr9p-0wh9b9-quyA2HeUphANBfbTpAkrZFvJBT_jfhM9EPhIxcOp-GN791NDYNZyUT0RUufmvvXq8TMWqwXtdpwzW-Ofhlvpm4LQW8EWkBW2LU24KdAAFtV_CdRj3uFrm-5YJAbVV70JxoqbyWWfI0Zu9TQU3_ZLimC7sLvD7uEB4TxrC74VzqxISL19zKOqRS1TTg2s2bSIB9Ztzhobjigs5-1xIgwE0GK4Nosfz10_028UXztH_aNlfWNrZ2YQ0lN4&lib=MJoCCRzvOuutnE4wxzvfXyxjH-oME6c33';
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as IStatistics[];
  }
}
