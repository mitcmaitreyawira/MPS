import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { QuestParticipantsService } from './quest-participants.service';
import { PointLogsService } from '../points/point-logs.service';
import { QuestsService } from './quests.service';
import { ReviewQuestDto, JoinQuestDto, SubmitQuestDto } from './dto';
import { QuestParticipant } from './entities/quest-participant.entity';
import { QuestCompletionStatus } from './entities/quest-participant.entity';
import { PointLog, PointType } from '../points/entities/point-log.entity';

@ApiTags('quest-participants')
@Controller('quests')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestParticipantsController {
  constructor(
    private readonly questParticipantsService: QuestParticipantsService,
    private readonly pointLogsService: PointLogsService,
    private readonly questsService: QuestsService,
  ) {}

  @Post(':id/join')
  @Roles('student')
  @ApiOperation({ summary: 'Join a quest' })
  @ApiParam({ name: 'id', description: 'Quest ID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined the quest.',
    type: QuestParticipant,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Quest not found.' })
  async joinQuest(
    @Param('id') questId: string,
    @Body() joinQuestDto: JoinQuestDto,
    @Req() req: Request,
  ): Promise<QuestParticipant> {
    const userPayload: any = (req as any).user;
    const studentId = userPayload.id;

    // Verify quest exists
    await this.questsService.findOne(questId);

    // Create quest participant
    const participant = await this.questParticipantsService.create({
      questId,
      studentId,
    });

    return participant;
  }

  @Post(':id/submit')
  @Roles('student')
  @ApiOperation({ summary: 'Submit a quest for review' })
  @ApiParam({ name: 'id', description: 'Quest ID' })
  @ApiResponse({
    status: 200,
    description: 'Quest submitted for review successfully.',
    type: QuestParticipant,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Quest or participant not found.' })
  async submitQuest(
    @Param('id') questId: string,
    @Body() submitQuestDto: SubmitQuestDto,
    @Req() req: Request,
  ): Promise<QuestParticipant> {
    const userPayload: any = (req as any).user;
    const studentId = userPayload.id;

    // Update quest participant status
    const participant = await this.questParticipantsService.update(
      questId,
      studentId,
      {
        status: QuestCompletionStatus.SUBMITTED_FOR_REVIEW,
      },
    );

    return participant;
  }

  @Post(':id/review')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Review a quest submission' })
  @ApiParam({ name: 'id', description: 'Quest ID' })
  @ApiResponse({
    status: 200,
    description: 'Quest reviewed successfully.',
    schema: {
      type: 'object',
      properties: {
        updatedParticipant: {
          $ref: '#/components/schemas/QuestParticipant',
        },
        pointLog: {
          oneOf: [
            { $ref: '#/components/schemas/PointLog' },
            { type: 'null' },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Quest or participant not found.' })
  async reviewQuest(
    @Param('id') questId: string,
    @Body() reviewQuestDto: ReviewQuestDto,
    @Req() req: Request,
  ): Promise<{ updatedParticipant: QuestParticipant; pointLog: PointLog | null }> {
    const { studentId, isApproved, reviewNotes } = reviewQuestDto;
    const userPayload: any = (req as any).user;
    const reviewerId = userPayload.id;

    // Get the quest to check permissions and get point value
    const quest = await this.questsService.findOne(questId);
    
    // Check if user has permission to review this quest
    if (
      quest.supervisorId !== reviewerId &&
      userPayload.role !== 'admin' &&
      userPayload.role !== 'super_secret_admin'
    ) {
      throw new Error('Insufficient permissions to review this quest');
    }

    // Update quest participant status
    const updatedParticipant = await this.questParticipantsService.update(
      questId,
      studentId,
      {
        status: isApproved
          ? QuestCompletionStatus.COMPLETED
          : QuestCompletionStatus.IN_PROGRESS,
        reviewNotes,
      },
    );

    let pointLog: PointLog | null = null;

    // Award points if approved
    if (isApproved && quest.points > 0) {
      pointLog = await this.pointLogsService.create({
        studentId: studentId,
        points: quest.points,
        type: PointType.QUEST,
        category: 'Quest Completion',
        description: `Quest completed: ${quest.title}`,
        addedBy: reviewerId,
        badge: quest.badgeTier ? {
          id: `quest-${questId}-${Date.now()}`,
          tier: quest.badgeTier,
          reason: quest.badgeReason || `Completed quest: ${quest.title}`,
          awardedBy: reviewerId,
          awardedOn: new Date(),
          icon: quest.badgeIcon,
        } : undefined,
      });
    }

    return {
      updatedParticipant,
      pointLog,
    };
  }
}