import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notice } from '../interfaces/notice.type';
import { concatMap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class NoticeService {
	onNoticeChanged: BehaviorSubject<Notice>;

	constructor(private message: NzMessageService) {
		this.onNoticeChanged = new BehaviorSubject(null);
	}

	setNotice(message: string, type?: 'error' | 'success' | 'info' | 'warning') {
		const notice: Notice = {
			message: message,
			type: type
		};
		this.onNoticeChanged.next(notice);
	}

	startShowMessages(): void {
		this.message
			.loading('Action in progress', { nzDuration: 2500 })
			.onClose!.pipe(
				concatMap(() => this.message.success('Loading finished', { nzDuration: 2500 }).onClose!),
				concatMap(() => this.message.info('Loading finished is finished', { nzDuration: 2500 }).onClose!)
			)
			.subscribe(() => {
				console.log('All completed!');
			});
	}
}
